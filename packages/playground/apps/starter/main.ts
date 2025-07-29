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
import { Text, type Workspace } from '@blocksuite/affine/store';
import EmojiPicker from 'emoji-picker-react'; // emoji-picker-react v4 기준

commentEffects();
itEffects();

// 이모지 매핑
const emojiMap: { [key: string]: string } = {
  'smile': '😊',
  'laugh': '😄', 
  'wink': '😉',
  'heart': '❤️',
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'fire': '🔥',
  'star': '⭐',
  'check': '✅',
  'x': '❌',
  'warning': '⚠️',
  'info': 'ℹ️',
  'question': '❓',
  'exclamation': '❗',
  'sun': '☀️',
  'moon': '🌙',
  'rainbow': '🌈',
  'rocket': '🚀',
  'party': '🎉',
  'gift': '🎁',
  'cake': '🎂',
  'coffee': '☕',
  'pizza': '🍕',
  'beer': '🍺',
  'wine': '🍷',
  'music': '🎵',
  'video': '🎬',
  'game': '🎮',
  'book': '📚',
  'pencil': '✏️',
  'computer': '💻',
  'phone': '📱',
  'camera': '📷',
  'clock': '⏰',
  'calendar': '📅',
  'money': '💰',
  'dollar': '💵',
  'euro': '💶',
  'yen': '💴',
  'pound': '💷',
  'gem': '💎',
  'crown': '👑',
  'trophy': '🏆',
  'medal': '🏅',
  'flag': '🏁',
  'map': '🗺️',
  'globe': '🌍',
  'building': '🏢',
  'house': '🏠',
  'car': '🚗',
  'plane': '✈️',
  'ship': '🚢',
  'train': '🚂',
  'bike': '🚲',
  'walk': '🚶',
  'run': '🏃',
  'dance': '💃',
  'sleep': '😴',
  'sick': '🤒',
  'cool': '😎',
  'nerd': '🤓',
  'clown': '🤡',
  'ghost': '👻',
  'alien': '👽',
  'robot': '🤖',
  'angel': '👼',
  'devil': '😈',
  'skull': '💀',
  'zombie': '🧟',
  'vampire': '🧛',
  'witch': '🧙',
  'fairy': '🧚',
  'dragon': '🐉',
  'unicorn': '🦄',
  'phoenix': '🦅',
  'griffin': '🦁',
  'pegasus': '🦄',
  'mermaid': '🧜',
  'siren': '🧜‍♀️',
  'triton': '🧜‍♂️',
  'centaur': '🐎',
  'minotaur': '🐂',
  'sphinx': '🦁',
  'hydra': '🐍',
  'chimera': '🦁',
  'cerberus': '🐕'
};

// 이모지 기능
function setupEmojiFeature() {
  let emojiPopup: HTMLElement | null = null;
  let currentInput: Element | null = null;

  // 현재 에디터 인스턴스에 접근하는 함수
  function getCurrentEditor() {
    // window.editor를 통해 현재 에디터 인스턴스에 접근
    const editor = (window as any).editor;
    if (editor) {
      console.log('✅ 에디터 인스턴스 발견:', editor);
      return editor;
    }
    
    // window.doc를 통해 현재 문서에 접근
    const doc = (window as any).doc;
    if (doc) {
      console.log('✅ 문서 인스턴스 발견:', doc);
      return doc;
    }
    
    console.log('❌ 에디터 또는 문서 인스턴스를 찾을 수 없습니다');
    return null;
  }

  // 블록 path를 사용하여 DOM 요소를 찾는 함수
  function findBlockElementByPath(path: string[], container: HTMLElement): HTMLElement | null {
    try {
      let currentElement: HTMLElement | null = container;
      
      for (const blockId of path) {
        if (!currentElement) {
          console.log(`❌ 경로 탐색 실패: ${blockId}에서 중단`);
          return null;
        }
        
        // data-block-id 속성을 사용하여 블록 요소 찾기
        const blockElement = currentElement.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
        if (!blockElement) {
          console.log(`❌ 블록 요소를 찾을 수 없습니다: ${blockId}`);
          return null;
        }
        
        console.log(`✅ 블록 요소 발견: ${blockId}`, blockElement);
        currentElement = blockElement;
      }
      
      return currentElement;
    } catch (error) {
      console.error('블록 요소 찾기 중 오류:', error);
      return null;
    }
  }

  // 키보드 이벤트 리스너
  document.addEventListener('keydown', (event) => {
    // 콜론(:) 키 감지
    if (event.key === ':') {
      console.log('🎯 콜론 감지됨!');
      
      // 현재 에디터 인스턴스 가져오기
      const editor = getCurrentEditor();
      if (!editor) {
        console.log('에디터 인스턴스를 찾을 수 없습니다');
        return;
      }

      // 에디터의 std.selection을 통해 현재 selection 가져오기
      // try {
      //   if (editor.std && editor.std.selection) {
      //     const selection = editor.std.selection;

      //     // TextSelection 찾기
      //     const textSelection = selection.value[0].blockId
      //     console.log('textSelection', textSelection);
      //     if (textSelection) {
      //       // 블록 내에서 v-text 요소 찾기
      //       const vTextElement = document.querySelector(`[data-block-id="${textSelection}"]`);
      //       console.log('vTextElement', vTextElement);
      //       if (vTextElement) {
      //         currentInput = vTextElement;
      //         console.log('currentInput', currentInput);
              
      //         // 이모지 팝업 표시
      //         // showEmojiPopup();
      //       } else {
      //         console.log('❌ v-text 요소를 찾을 수 없습니다');
      //       }
      //     } else {
      //       console.log('❌ TextSelection을 찾을 수 없습니다');
            
      //       // fallback: 기존 방식 사용
      //       const activeElement = document.activeElement;
      //       if (!activeElement) return;

      //       const editorContainer = activeElement.closest('affine-page-root');
      //       if (!editorContainer) {
      //         console.log('BlockSuite 에디터를 찾을 수 없습니다');
      //         return;
      //       }

      //       const vTextElement = editorContainer.querySelector('[data-v-text="true"]');
      //       if (vTextElement) {
      //         currentInput = vTextElement;
      //         showEmojiPopup();
      //       } else {
      //         console.log('❌ v-text 요소를 찾을 수 없습니다');
      //       }
      //     }
      //   }
      // } catch (error) {
      //   console.error('❌ 에디터 selection 처리 중 오류:', error);
        
      //   // fallback: 기존 방식 사용
      //   const activeElement = document.activeElement;
      //   if (!activeElement) return;

      //   const editorContainer = activeElement.closest('affine-page-root');
      //   if (!editorContainer) {
      //     console.log('BlockSuite 에디터를 찾을 수 없습니다');
      //     return;
      //   }

      //   const vTextElement = editorContainer.querySelector(`[data-block-id="${blockPath}"]`);
      //   if (vTextElement) {
      //     currentInput = vTextElement;
      //     console.log('✅ fallback: v-text 요소 발견:', vTextElement);
      //     showEmojiPopup();
      //   }
      // }
    }
  });

  // 이모지 팝업 표시
  function showEmojiPopup() {
    try {
      // 기존 팝업 제거
      if (emojiPopup) {
        emojiPopup.remove();
        emojiPopup = null;
      }

      // 팝업 생성
      emojiPopup = document.createElement('div');
      emojiPopup.className = 'emoji-popup';
      emojiPopup.setAttribute('data-emoji-popup', 'true');
      emojiPopup.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        max-height: 300px;
        overflow-y: auto;
        font-family: Arial, sans-serif;
        padding: 8px 0;
        min-width: 200px;
        pointer-events: auto;
        user-select: none;
        isolation: isolate;
      `;

      // 이모지 목록 생성
      const emojiList = document.createElement('div');
      emojiList.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
        padding: 8px;
      `;

      Object.entries(emojiMap).forEach(([name, emoji]) => {
        const emojiItem = document.createElement('div');
        emojiItem.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
          font-size: 12px;
          text-align: center;
        `;
        emojiItem.innerHTML = `
          <span style="font-size: 20px; margin-bottom: 4px;">${emoji}</span>
          <span style="color: #666;">${name}</span>
        `;

        emojiItem.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          
          insertEmoji(name, emoji);
          hideEmojiPopup();
        });

        emojiItem.addEventListener('mouseenter', () => {
          emojiItem.style.backgroundColor = '#f0f0f0';
        });

        emojiItem.addEventListener('mouseleave', () => {
          emojiItem.style.backgroundColor = 'transparent';
        });

        emojiList.appendChild(emojiItem);
      });

      emojiPopup.appendChild(emojiList);

      // 팝업을 document.body에 추가
      document.body.appendChild(emojiPopup);

      // 위치 조정 (화면 중앙에 표시)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popupWidth = 300;
      const popupHeight = 400;
      
      emojiPopup.style.left = `${(viewportWidth - popupWidth) / 2}px`;
      emojiPopup.style.top = `${(viewportHeight - popupHeight) / 2}px`;

      // 5초 후 자동으로 숨김
      setTimeout(() => {
        hideEmojiPopup();
      }, 5000);
      
    } catch (error) {
      console.error('❌ 이모지 팝업 생성 중 오류:', error);
    }
  }

  // 이모지 팝업 숨기기
  function hideEmojiPopup() {
    if (emojiPopup) {
      emojiPopup.remove();
      emojiPopup = null;
    }
  }

  // 이모지 삽입
  function insertEmoji(name: string, emoji: string) {
    if (!currentInput) return;

    console.log(`🎯 이모지 삽입: ${name} → ${emoji}`);

    try {
      // 현재 텍스트 가져오기
      const currentText = currentInput?.querySelector('[data-v-text="true"]')?.innerHTML || '';
      console.log('currentText', currentText);
      
      // 콜론을 찾아서 이모지로 교체
      const colonIndex = currentText.lastIndexOf(':');
      console.log('colonIndex', colonIndex);
      if (colonIndex !== -1) {
        const beforeColon = currentText.substring(0, colonIndex);
        const afterColon = currentText.substring(colonIndex + 1);
        
        // 새로운 텍스트 생성
        const newText = beforeColon + emoji + afterColon;
        document.querySelector(`[data-block-id="${currentInput.blockId}"]`).querySelector('[data-v-text="true"]').innerHTML = newText;

        console.log('newText', newText);
        console.log('currentInput', currentInput);
        
        // 커서 위치 조정
        // const newCursorPosition = beforeColon.length + emoji.length;
        // const range = document.createRange();
        // const selection = window.getSelection();
        
        // if (currentInput.firstChild && selection) {
        //   range.setStart(currentInput.firstChild, newCursorPosition);
        //   range.setEnd(currentInput.firstChild, newCursorPosition);
        //   selection.removeAllRanges();
        //   selection.addRange(range);
        // }
        
        console.log('✅ 이모지 삽입 완료');
      }
    } catch (error) {
      console.error('❌ 이모지 삽입 중 오류:', error);
    }
  }

  // 외부 클릭 시 팝업 숨기기
  document.addEventListener('click', (event) => {
    if (emojiPopup && !emojiPopup.contains(event.target as Node)) {
      try {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        hideEmojiPopup();
      } catch (error) {
        console.error('❌ 외부 클릭 처리 중 오류:', error);
        hideEmojiPopup();
      }
    }
  }, true);

  // ESC 키로 팝업 숨기기
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && emojiPopup) {
      hideEmojiPopup();
    }
  });
}

// 붙여넣기 기능을 위한 함수
function setupPasteHandler() {
  document.addEventListener('paste', (event) => {
    console.log('📋 붙여넣기 이벤트 감지됨');
    
    // 클립보드에서 텍스트 가져오기
    const clipboardData = event.clipboardData;
    if (!clipboardData) {
      console.log('클립보드 데이터가 없습니다');
      return;
    }

    const pastedText = clipboardData.getData('text/plain');
    if (!pastedText) {
      console.log('붙여넣을 텍스트가 없습니다');
      return;
    }

    console.log('붙여넣은 텍스트:', pastedText);

    // BlockSuite 에디터에 텍스트 삽입
    insertTextToBlockSuiteEditor(pastedText);
  });
}

// BlockSuite 에디터에 텍스트 삽입하는 함수
function insertTextToBlockSuiteEditor(text: string) {
  try {
    // 현재 포커스된 요소 찾기
    const activeElement = document.activeElement;
    if (!activeElement) {
      console.log('활성화된 요소가 없습니다');
      return;
    }

    // BlockSuite 에디터 영역인지 확인
    const editorContainer = activeElement.closest('.affine-editor-container');
    if (!editorContainer) {
      console.log('BlockSuite 에디터를 찾을 수 없습니다');
      return;
    }

    // 현재 선택된 영역 찾기
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('선택된 영역이 없습니다');
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // DOM 텍스트 노드인지 확인
    if (container.nodeType === 3) { // TEXT_NODE
      const textNode = container as globalThis.Text;
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;
      
      // 선택된 텍스트를 새로운 텍스트로 교체
      const newText = textNode.textContent || '';
      const beforeText = newText.substring(0, startOffset);
      const afterText = newText.substring(endOffset);
      const finalText = beforeText + text + afterText;
      
      textNode.textContent = finalText;
      
      // 커서 위치 조정
      const newRange = document.createRange();
      newRange.setStart(textNode, startOffset + text.length);
      newRange.setEnd(textNode, startOffset + text.length);
      
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      console.log('✅ 텍스트가 성공적으로 삽입되었습니다');
    } else {
      console.log('텍스트 노드가 아닙니다. 컨테이너 타입:', container.nodeType);
    }

  } catch (error) {
    console.error('텍스트 삽입 중 오류:', error);
  }
}

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

  // 블록 요소를 찾는 유틸리티 함수
  function findBlockElementByPath(path: string[], container: HTMLElement): HTMLElement | null {
    let currentElement: HTMLElement | null = container;
    for (const segment of path) {
      if (!currentElement) return null;
      currentElement = currentElement.querySelector(`[data-block-id="${segment}"]`);
    }
    return currentElement;
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

  // JSON 데이터로부터 문서 내용을 설정하는 함수
  function setDocumentContent(jsonData: any) {
    try {
      console.log('📥 문서 설정 요청 받음', jsonData);
      
      if (!jsonData || !jsonData.blocks) {
        console.log('유효하지 않은 JSON 데이터입니다');
        throw new Error('유효하지 않은 JSON 데이터입니다');
      }

      console.log('window.doc', window.doc);
      const doc = window.doc;
      if (!doc) {
        console.log('현재 문서를 찾을 수 없습니다');
        throw new Error('현재 문서를 찾을 수 없습니다');
      }

      // 문서 내용을 모두 지우고 새로 시작
      // doc.clear();
      console.log('doc', doc);
      
      // doc.load() 함수를 사용하여 새로운 내용 로드
      doc.load(() => {
        console.log('doc.load');
        try {
          // 제목 추출
          console.log('제목 추출 시작');
          const title = extractTitle(jsonData);
          
          // 새로운 루트 블록 생성
          const rootId = doc.addBlock('affine:page', {
            title: new Text(title)
          });
          
          // Surface 블록 추가
          doc.addBlock('affine:surface', {}, rootId);
          
          // Note 블록 추가 (Untitled-2 스타일)
          const noteId = doc.addBlock('affine:note', { 
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
          }, rootId);
          
          // JSON 데이터에서 블록들을 추출하여 추가
          addBlocksFromJson(jsonData, doc, noteId);
          
          // 히스토리 리셋
          doc.resetHistory();
          
          console.log('✅ 문서 내용 설정 완료');
          
          // 성공 응답 전송
          sendToParent('documentSetSuccess', {
            success: true,
            message: '문서가 성공적으로 설정되었습니다'
          });
          
          // 새로 설정된 문서 내용을 부모에게 전송
          setTimeout(() => {
            const newJsonData = getDocumentAsJson();
            if (newJsonData) {
              sendToParent('documentUpdated', newJsonData);
            }
          }, 100);
          
        } catch (innerError) {
          console.error('❌ 블록 추가 실패:', innerError);
          throw innerError;
        }
      });
      
    } catch (error) {
      console.error('❌ 문서 설정 실패:', error);
      
      // 실패 응답 전송
      sendToParent('documentSetError', {
        success: false,
        error: (error as Error).message || '알 수 없는 오류가 발생했습니다'
      });
    }
  }

  // JSON에서 제목 추출
  function extractTitle(jsonData: any) {
    try {
      if (jsonData.blocks?.props?.title?.delta) {
        const titleDelta = jsonData.blocks.props.title.delta;
        if (Array.isArray(titleDelta) && titleDelta.length > 0) {
          return titleDelta.map(item => item.insert || '').join('');
        }
      }
      return '';
    } catch (error) {
      console.warn('제목 추출 실패:', error);
      return '';
    }
  }

  // JSON 데이터에서 블록들을 추출하여 문서에 추가
  function addBlocksFromJson(jsonData: any, doc: any, parentId: string) {
    try {
      const blocks = jsonData.blocks;
      if (!blocks) return;

      // 재귀적으로 블록들을 처리
      function processBlock(block: any, parent: string) {
        if (!block || !block.flavour) return;
        
        // 페이지나 서피스 블록은 이미 생성했으므로 스킵
        if (block.flavour === 'affine:page' || block.flavour === 'affine:surface') {
          // 자식 블록들만 처리
          if (block.children && Array.isArray(block.children)) {
            block.children.forEach((child: any) => {
              processBlock(child, parent);
            });
          }
          return;
        }

        // 노트 블록인 경우, 이미 생성된 노트 블록을 사용
        if (block.flavour === 'affine:note') {
          if (block.children && Array.isArray(block.children)) {
            block.children.forEach((child: any) => {
              processBlock(child, parent);
            });
          }
          return;
        }

        // 일반 블록들 처리
        const blockProps: any = {};
        
        // 텍스트 내용 추출
        if (block.props?.text && block.props.text['$blocksuite:internal:text$']) {
          const delta = block.props.text.delta;
          if (Array.isArray(delta)) {
            const textContent = delta.map(item => item.insert || '').join('');
            if (textContent) {
              // 텍스트 블록으로 변환
              const newBlockId = doc.addBlock('affine:paragraph', {
                type: 'text',
                text: new Text(textContent),
                collapsed: false
              }, parent);
              console.log(`📝 블록 추가됨: "${textContent}" (${block.flavour} → affine:paragraph)`);
            }
          }
        } else {
          // 텍스트가 없는 블록은 기본 단락으로
          doc.addBlock('affine:paragraph', {}, parent);
        }
      }

      // 루트 블록부터 처리 시작
      processBlock(blocks, parentId);
      
    } catch (error) {
      console.error('블록 추가 중 오류:', error);
      // 오류가 발생해도 기본 단락 블록 하나는 추가
      doc.addBlock('affine:paragraph', {}, parentId);
    }
  }

  // 실시간으로 문서 변경사항을 부모에게 전달
  function setupRealtimeSync() {
  //   if (window.doc) {
  //     // 문서가 변경될 때마다 부모에게 JSON 데이터 전송
  //     window.doc.slots.blockUpdated.on(() => {
  //       const jsonData = getDocumentAsJson();
  //       if (jsonData) {
  //         sendToParent('documentUpdated', jsonData);
  //       }
  //     });

  //     // 초기 문서 내용 전송
      const initialData = getDocumentAsJson();
      if (initialData) {
        sendToParent('documentLoaded', initialData);
      }
  //   }
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
          // 부모가 문서 내용을 설정할 때
          setDocumentContent(event.data.data);
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
  
  // 붙여넣기 기능 초기화
  setupPasteHandler();
  
  // 이모지 기능 초기화
  setupEmojiFeature();
  
  // 문서가 로드된 후 실시간 동기화 설정
  setTimeout(() => {
    iframeApi.setupRealtimeSync();
  }, 1000);
}

const storeManager = getTestStoreManager();
main().catch(console.error);
