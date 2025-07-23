import { Text, type Workspace } from '@blocksuite/affine/store';

import type { InitFn } from './utils.js';

export const preset: InitFn = async (collection: Workspace, id: string) => {
  let doc = collection.getDoc(id);
  const hasDoc = !!doc;
  if (!doc) {
    doc = collection.createDoc(id);
  }

  const store = doc.getStore({ id });
  store.load();

  // Run only once on all clients.
  let noteId: string;
  if (!hasDoc) {
    // Add root block and surface block at root level
    const rootId = store.addBlock('affine:page', {
      title: new Text(''),
    });
    store.addBlock('affine:surface', {}, rootId);

    // Add note block inside root block
    noteId = store.addBlock(
      'affine:note',
      { xywh: '[0, 100, 800, 640]' },
      rootId
    );
    // Add empty paragraph block inside note block
    store.addBlock('affine:paragraph', {}, noteId);
  }

  store.resetHistory();
};

preset.id = 'preset';
preset.displayName = 'BlockSuite Starter';
preset.description = 'Start from friendly introduction';
