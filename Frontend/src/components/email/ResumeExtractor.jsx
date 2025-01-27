import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Upload, FilePlus } from "lucide-react";
import React from "react";

const ResumeExtractor = () => {
  const handleFileUpload = (e) => {
    // Handle file upload logic
  };

  const handleBulkImport = () => {
    // Handle bulk import logic
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Extraction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <FilePlus className="w-4 h-4 mr-2" />
                Select Files
              </Button>
              <input
                id="fileInput"
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              or drag and drop files here
            </p>
          </div>

          <Button
            onClick={handleBulkImport}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Process Selected Resumes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeExtractor;
