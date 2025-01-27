import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Sliders, Plus, Save, Trash2 } from "lucide-react";
import React, { useState } from "react";

const SetupCriteria = () => {
  const [criteria, setCriteria] = useState({
    skills: [
      { name: "React", weight: 30, mandatory: true },
      { name: "Node.js", weight: 20, mandatory: false },
      { name: "Python", weight: 15, mandatory: false },
    ],
    qualifications: [
      { name: "Bachelor's Degree", weight: 20, mandatory: true },
      { name: "Master's Degree", weight: 10, mandatory: false },
    ],
    experience: {
      minYears: 3,
      weight: 25,
    },
    keywords: ["problem solving", "team player", "agile"],
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    weight: 0,
    mandatory: false,
  });

  const handleAddSkill = () => {
    if (newSkill.name) {
      setCriteria({
        ...criteria,
        skills: [...criteria.skills, newSkill],
      });
      setNewSkill({ name: "", weight: 0, mandatory: false });
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Criteria Setup */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Setup Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Skills Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Required Skills
                  </h3>
                  <div className="space-y-4">
                    {criteria.skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <input
                          type="text"
                          value={skill.name}
                          className="flex-1 p-2 border rounded-md"
                          placeholder="Skill name"
                          readOnly
                        />
                        <div className="flex-1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={skill.weight}
                            className="w-full"
                          />
                          <div className="text-sm text-gray-500 text-center">
                            Weight: {skill.weight}%
                          </div>
                        </div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={skill.mandatory}
                            className="rounded"
                          />
                          <span className="text-sm">Mandatory</span>
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Add New Skill */}
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={newSkill.name}
                        onChange={(e) =>
                          setNewSkill({ ...newSkill, name: e.target.value })
                        }
                        className="flex-1 p-2 border rounded-md"
                        placeholder="Add new skill"
                      />
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={newSkill.weight}
                          onChange={(e) =>
                            setNewSkill({
                              ...newSkill,
                              weight: parseInt(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                        <div className="text-sm text-gray-500 text-center">
                          Weight: {newSkill.weight}%
                        </div>
                      </div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newSkill.mandatory}
                          onChange={(e) =>
                            setNewSkill({
                              ...newSkill,
                              mandatory: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Mandatory</span>
                      </label>
                      <Button
                        onClick={handleAddSkill}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Experience Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Experience Requirements
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium">
                        Minimum Years
                      </label>
                      <input
                        type="number"
                        value={criteria.experience.minYears}
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium">Weight</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={criteria.experience.weight}
                        className="w-full mt-1"
                      />
                      <div className="text-sm text-gray-500 text-center">
                        {criteria.experience.weight}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keywords Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Additional Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {criteria.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {keyword}
                        <button className="ml-2">×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="p-2 border rounded-md"
                      placeholder="Add keyword"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Reset</Button>
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <Save className="w-4 h-4 mr-2" />
                    Save Criteria
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Scoring */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Scoring Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Weight Distribution
                  </h3>
                  {/* Add a pie chart or bar chart here showing weight distribution */}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Scoring Formula
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Final Score = (Skills Score ×{" "}
                      {criteria.skills.reduce(
                        (acc, skill) => acc + skill.weight,
                        0
                      )}
                      %) + (Experience Score × {criteria.experience.weight}%)
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Mandatory Requirements
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {criteria.skills
                      .filter((skill) => skill.mandatory)
                      .map((skill, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {skill.name}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SetupCriteria;
