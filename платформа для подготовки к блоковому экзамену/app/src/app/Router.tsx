import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import BranchPage from '@/pages/BranchPage';
import LessonViewer from '@/components/LessonViewer';

export default function Router() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/branch/:branch" element={<BranchPage />} />
        <Route path="/lesson/:lessonId" element={<LessonViewer />} />
      </Routes>
    </Layout>
  );
}
