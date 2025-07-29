import { Text, type Workspace } from '@blocksuite/affine/store';

import type { InitFn } from './utils.js';

export const preset: InitFn = async (collection: Workspace, id: string) => {
  let doc = collection.getDoc(id);
  const hasDoc = !!doc;
  if (!doc) {
    doc = collection.createDoc(id);
  }

  const store = doc.getStore({ id });
  
  // doc.load() 함수를 사용하여 Untitled-2 데이터 로드
  doc.load(() => {
    console.log('doc.load');
    // Add root block and surface block at root level
    const rootId = store.addBlock('affine:page', {
      title: new Text('asdf'),
    });
    store.addBlock('affine:surface', {}, rootId);

    // Add note block inside root block with Untitled-2 data
    const noteId = store.addBlock(
      'affine:note',
      { 
        xywh: '[0, 100, 800, 640]',
        background: { dark: '#252525', light: '#ffffff' },
        index: 'a0',
        lockedBySelf: false,
        hidden: false,
        displayMode: 'both',
        edgeless: {
          style: {
            borderRadius: 8,
            borderSize: 4,
            borderStyle: 'none',
            shadowType: '--affine-note-shadow-box'
          }
        }
      },
      rootId
    );
    
    // Add paragraph block with Untitled-2 content
    store.addBlock('affine:paragraph', {
      type: 'text',
      text: new Text('asfdasfd'),
      collapsed: false
    }, noteId);
  });

  store.resetHistory();
};

preset.id = 'preset';
preset.displayName = 'BlockSuite Starter';
preset.description = 'Start from friendly introduction';
