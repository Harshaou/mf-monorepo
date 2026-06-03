import type { RemoteModule } from '@ginja/contracts';
import { ProductCatalog } from './pages/ProductCatalog';
import { ProductDetail } from './pages/ProductDetail';
import { NotFound } from './pages/NotFound';

/** THE CONTRACT — the default export the Shell mounts under "/product-config". */
const productConfigModule: RemoteModule = {
  meta: { id: 'product-config', title: 'Product Config' },
  routes: [
    { index: true, element: <ProductCatalog /> },
    { path: ':id', element: <ProductDetail /> },
    { path: '*', element: <NotFound /> },
  ],
};

export default productConfigModule;
