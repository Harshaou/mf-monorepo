import type { RemoteModule } from '@ginja/contracts';
import { SubmissionsQueue } from './pages/SubmissionsQueue';
import { SubmissionDetail } from './pages/SubmissionDetail';
import { NotFound } from './pages/NotFound';

/**
 * THE CONTRACT. This default export is what the Shell mounts. Its routes are relative,
 * so the Shell can mount the whole module under any base path (it uses "/underwriting").
 * Failing to satisfy `RemoteModule` makes the Shell reject the remote loudly.
 */
const underwritingModule: RemoteModule = {
  meta: { id: 'underwriting', title: 'Underwriting' },
  routes: [
    { index: true, element: <SubmissionsQueue /> },
    { path: 'submissions/:id', element: <SubmissionDetail /> },
    { path: '*', element: <NotFound /> },
  ],
};

export default underwritingModule;
