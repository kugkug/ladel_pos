import { toast } from '@/components/ui/use-toast';

export const downloadFile = (file, defaultName) => {
  if (!file) {
    toast({
      title: "Error",
      description: "File not found or is unavailable.",
      variant: "destructive"
    });
    return;
  }

  try {
    // If it's a File object (from local upload in this prototype)
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name || defaultName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Downloading ${file.name || defaultName}...`
      });
    } else {
      toast({
        title: "Not Implemented",
        description: "Downloading remote files is not fully implemented in this prototype.",
        variant: "destructive"
      });
    }
  } catch (error) {
    console.error("Download error:", error);
    toast({
      title: "Error",
      description: "Failed to download file.",
      variant: "destructive"
    });
  }
};