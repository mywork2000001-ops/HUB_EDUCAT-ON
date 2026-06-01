import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardPage from '@/pages/DashboardPage';
import TopicsPage from '@/pages/TopicsPage';
import TopicDetailPage from '@/pages/TopicDetailPage';
import TopicLessonPage from '@/pages/TopicLessonPage';
import TestsPage from '@/pages/TestsPage';
import TestViewPage from '@/pages/TestViewPage';
import ProofsPage from '@/pages/ProofsPage';
import ProofViewPage from '@/pages/ProofViewPage';
import SituationalPage from '@/pages/SituationalPage';
import SituationalViewPage from '@/pages/SituationalViewPage';

export default function Router() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />

        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/topic/:slug" element={<TopicDetailPage />} />
        <Route path="/topic/:slug/lesson/:lessonId" element={<TopicLessonPage />} />

        <Route path="/tests" element={<TestsPage />} />
        <Route path="/test/:slug" element={<TestViewPage />} />

        <Route path="/proofs" element={<ProofsPage />} />
        <Route path="/proof/:slug" element={<ProofViewPage />} />

        <Route path="/situational" element={<SituationalPage />} />
        <Route path="/situational/:slug" element={<SituationalViewPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
