import { useState } from 'react';
import MindMapEditor from "@/components/MindMapEditor";
import HomeScreen from "@/components/HomeScreen";

const Index = () => {
  const [showEditor, setShowEditor] = useState(false);

  if (showEditor) {
    return <MindMapEditor onGoHome={() => setShowEditor(false)} />;
  }

  return <HomeScreen onOpenEditor={() => setShowEditor(true)} />;
};

export default Index;
