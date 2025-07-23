import '../../style.css';

import * as databaseBlocks from '@blocksuite/affine/blocks/database';
import * as noteBlocks from '@blocksuite/affine/blocks/note';
import * as globalUtils from '@blocksuite/affine/global/utils';
import * as services from '@blocksuite/affine/shared/services';
import * as blockStd from '@blocksuite/affine/std';
import * as store from '@blocksuite/affine/store';
import * as affineModel from '@blocksuite/affine-model';
import * as editor from '@blocksuite/integration-test';
import { effects as itEffects } from '@blocksuite/integration-test/effects';
import { getTestStoreManager } from '@blocksuite/integration-test/store';

import { setupEdgelessTemplate } from '../_common/setup.js';
import { effects as commentEffects } from '../comment/effects.js';
import {
  createStarterDocCollection,
  initStarterDocCollection,
} from './utils/collection.js';
import { mountDefaultDocEditor } from './utils/setup-playground';
import { prepareTestApp } from './utils/test';

commentEffects();
itEffects();

// iframe과 부모 컨테이너 간의 통신을 위한 함수들
function setupIframeApi() {
  // 문서 내용을 JSON으로 추출하는 함수
  function getDocumentAsJson() {
    try {
      const doc = window.doc;
      const job = window.job;
      
      if (!doc || !job) {
        throw new Error('Document or transformer not available');
      }

      // 문서를 스냅샷(JSON)으로 변환
      const snapshot = job.docToSnapshot(doc);
      return snapshot;
    } catch (error) {
      console.error('Error extracting document as JSON:', error);
      return null;
    }
  }

  // 부모 윈도우로 데이터를 전송하는 함수
  function sendToParent(type: string, data: any) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type,
        data,
        source: 'blocksuite-iframe'
      }, '*');
    }
  }

  // 실시간으로 문서 변경사항을 부모에게 전달
  function setupRealtimeSync() {
    if (window.doc) {
      // 문서가 변경될 때마다 부모에게 JSON 데이터 전송
      window.doc.slots.blockUpdated.on(() => {
        const jsonData = getDocumentAsJson();
        if (jsonData) {
          sendToParent('documentUpdated', jsonData);
        }
      });

      // 초기 문서 내용 전송
      const initialData = getDocumentAsJson();
      if (initialData) {
        sendToParent('documentLoaded', initialData);
      }
    }
  }

  // 부모로부터 메시지를 받는 리스너
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'getDocument':
          // 부모가 현재 문서 내용을 요청할 때
          const jsonData = getDocumentAsJson();
          sendToParent('documentData', jsonData);
          break;
        
        case 'setDocument':
          // 부모가 문서 내용을 설정할 때 (향후 구현 가능)
          console.log('Set document request received:', event.data.data);
          break;
      }
    }
  });

  // 전역 함수로 노출 (디버깅용)
  (window as any).getDocumentAsJson = getDocumentAsJson;
  (window as any).sendToParent = sendToParent;

  return {
    getDocumentAsJson,
    sendToParent,
    setupRealtimeSync
  };
}

async function main() {
  if (window.collection) return;

  setupEdgelessTemplate();

  const params = new URLSearchParams(location.search);
  const room = params.get('room') ?? Math.random().toString(16).slice(2, 8);
  const isE2E = room.startsWith('playwright');
  const collection = createStarterDocCollection(storeManager);

  if (isE2E) {
    Object.defineProperty(window, '$blocksuite', {
      value: Object.freeze({
        store,
        blocks: {
          database: databaseBlocks,
          note: noteBlocks,
        },
        global: { utils: globalUtils },
        services,
        editor,
        blockStd: blockStd,
        affineModel: affineModel,
      }),
    });
    await prepareTestApp(collection);

    return;
  }

  await initStarterDocCollection(collection);
  await mountDefaultDocEditor(collection);

  // iframe API 설정
  const iframeApi = setupIframeApi();
  
  // 문서가 로드된 후 실시간 동기화 설정
  setTimeout(() => {
    iframeApi.setupRealtimeSync();
  }, 1000);
}

const storeManager = getTestStoreManager();
main().catch(console.error);
