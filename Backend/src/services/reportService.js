// Modify this function in reportService.js to fix the totalScore.toFixed error

exports.generateCandidateReport = async (resumeId, userId) => {
  try {
    // Get resume with related data
    const resume = await Resume.findByPk(resumeId, {
      include: [
        {
          model: Candidate,
          as: 'candidate'
        },
        {
          model: Job,
          as: 'job'
        },
        {
          model: ResumeScore,
          as: 'scores'
        }
      ]
    });
    
    if (!resume) {
      throw new Error('Resume not found');
    }
    
    // Generate report content using Python model
    const reportContent = await generateReportContent(resume);
    
    // Create report record
    const report = await Report.create({
      resume_id: resumeId,
      type: resume.status === 'shortlisted' ? 'shortlisted' : 'rejected',
      content: reportContent,
      generated_by: userId,
      sent: false
    });
    
    // Get complete report with related data
    const completeReport = await Report.findByPk(report.id, {
      include: [
        {
          model: Resume,
          as: 'resume',
          include: [
            {
              model: Candidate,
              as: 'candidate'
            },
            {
              model: Job,
              as: 'job'
            }
          ]
        },
        {
          model: User,
          as: 'generator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    return completeReport;
  } catch (error) {
    throw error;
  }
};

// Modify generateReportContent function to fix the totalScore.toFixed error
const generateReportContent = async (resume) => {
  try {
    // Try to get existing score data
    let scoreData = null;
    if (resume.scores && resume.scores.length > 0) {
      scoreData = resume.scores[0];
    }
    
    // If no score data exists, use Python model to generate a basic report
    if (!scoreData) {
      return await generateBasicReport(resume);
    }
    
    // Build comprehensive report based on score data
    const candidateName = resume.candidate.name;
    const jobTitle = resume.job ? resume.job.title : 'the position';
    
    // Parse JSON fields
    let matchingSkills = [];
    let missingSkills = [];
    let strengths = [];
    let improvements = [];

    try {
      matchingSkills = JSON.parse(scoreData.matching_skills || '[]');
      missingSkills = JSON.parse(scoreData.missing_skills || '[]');
      strengths = JSON.parse(scoreData.strengths || '[]');
      improvements = JSON.parse(scoreData.improvements || '[]');
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      // Use empty arrays as fallback
      matchingSkills = [];
      missingSkills = [];
      strengths = [];
      improvements = [];
    }

    // Ensure all scores are numbers
    const scores = {
      total: parseFloat(scoreData.total_score || 0),
      skills: parseFloat(scoreData.skills_score || 0),
      experience: parseFloat(scoreData.experience_score || 0),
      keyword: parseFloat(scoreData.keyword_score || 0)
    };
    
    let reportContent = `
      <h2>Candidate Evaluation Report</h2>
      <h3>Overview</h3>
      <p><strong>Candidate:</strong> ${candidateName}</p>
      <p><strong>Position:</strong> ${jobTitle}</p>
      <p><strong>Overall Match Score:</strong> ${scores.total.toFixed(2)}%</p>
     
      <h3>Score Breakdown</h3>
      <ul>
        <li><strong>Skills Match:</strong> ${scores.skills.toFixed(2)}%</li>
        <li><strong>Experience Match:</strong> ${scores.experience.toFixed(2)}%</li>
        <li><strong>Keyword Match:</strong> ${scores.keyword.toFixed(2)}%</li>
      </ul>
     
      <h3>Matching Skills</h3>
      <ul>
        ${matchingSkills.map(skill => `<li>${skill}</li>`).join('\n        ')}
      </ul>
     
      <h3>Missing Skills</h3>
      <ul>
        ${missingSkills.map(skill => `<li>${skill}</li>`).join('\n        ')}
      </ul>
     
      <h3>Candidate Strengths</h3>
      <p>Based on the resume analysis, ${candidateName} demonstrates strengths in the following areas:</p>
      <ul>
        ${strengths.map(strength => `<li>${strength}</li>`).join('\n        ')}
      </ul>
     
      <h3>Areas for Improvement</h3>
      <p>To better align with ${jobTitle}, the candidate could improve in these areas:</p>
      <ul>
        ${improvements.map(improvement => `<li>${improvement}</li>`).join('\n        ')}
      </ul>
     
      <h3>Recommendation</h3>
      <p>${getRecommendation(scores.total)}</p>
    `;
    
    return reportContent;
  } catch (error) {
    console.error('Error generating report content:', error);
    return await generateBasicReport(resume);
  }
};

// Also fix the getRecommendation function to handle non-number inputs
const getRecommendation = (score) => {
  // Ensure score is a number
  const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;
  
  if (numScore >= 85) {
    return 'This candidate is an excellent match for the position. Recommend proceeding to the next stage of the interview process.';
  } else if (numScore >= 70) {
    return 'This candidate is a good match for the position. Consider for further evaluation.';
  } else if (numScore >= 50) {
    return 'This candidate meets some of the requirements. May require additional screening or skills development.';
  } else {
    return 'This candidate is not a strong match for this specific position. Consider for other opportunities that better align with their skills.';
  }
};
// Ensure the correct implementation of the generateReportContent function
// Add these changes to the generateBasicReport function as well to fix any potential issues there

const generateBasicReport = async (resume) => {
  try {
    const candidateName = resume.candidate.name;
    const jobTitle = resume.job ? resume.job.title : 'the position';
    
    // Parse skills array
    let skills = [];
    try {
      skills = Array.isArray(resume.skills) ? resume.skills : JSON.parse(resume.skills || '[]');
    } catch (error) {
      console.error('Error parsing skills:', error);
      skills = [];
    }
    
    // Parse education array
    let education = [];
    try {
      education = Array.isArray(resume.education) ? resume.education : JSON.parse(resume.education || '[]');
    } catch (error) {
      console.error('Error parsing education:', error);
      education = [];
    }
    
    // Format education entries
    const formatEducation = (eduArray) => {
      return eduArray.map(edu => {
        if (typeof edu === 'string') return edu;
        return `${edu.degree || 'Degree'} from ${edu.institution || 'Institution'}`;
      }).join(', ');
    };
    
    return `
      <h2>Basic Candidate Report</h2>
      <p><strong>Candidate:</strong> ${candidateName}</p>
      <p><strong>Position:</strong> ${jobTitle}</p>
      <p><strong>Experience:</strong> ${resume.experience_years || 0} years</p>
      <p><strong>Skills:</strong> ${skills.join(', ')}</p>
      <p><strong>Education:</strong> ${formatEducation(education)}</p>
      <p>This is an automatically generated basic report as detailed analysis is not available.</p>
    `;
  } catch (error) {
    console.error('Error generating basic report:', error);
    return `
      <h2>Basic Candidate Report</h2>
      <p>Error generating report: ${error.message}</p>
    `;
  }
};