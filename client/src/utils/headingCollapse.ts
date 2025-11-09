/**
 * 标题折叠功能 - 类似语雀的实现
 * 为 H1-H6 标题添加展开/收起功能
 */

export interface HeadingCollapseState {
  [key: string]: boolean; // key 是标题的唯一标识，value 是折叠状态
}

/**
 * 初始化标题折叠功能
 */
export function initHeadingCollapse(editorElement: HTMLElement): () => void {
  const collapseState: HeadingCollapseState = {};
  let isProcessing = false; // 防止递归调用

  // 为所有标题添加折叠按钮
  const addCollapseButtons = () => {
    // 如果正在处理，跳过
    if (isProcessing) {
      return;
    }

    isProcessing = true;

    try {
      const headings = editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6');

      headings.forEach((heading, index) => {
        // 如果已经有折叠按钮，跳过
        if (heading.querySelector('.heading-collapse-btn')) {
          return;
        }

        // 如果标题没有 data-heading-id，创建一个
        let headingId = heading.getAttribute('data-heading-id');
        if (!headingId) {
          headingId = `heading-${index}-${Date.now()}`;
          heading.setAttribute('data-heading-id', headingId);
        }

        // 创建折叠按钮
        const collapseBtn = document.createElement('span');
        collapseBtn.className = 'heading-collapse-btn';
        collapseBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        collapseBtn.contentEditable = 'false'; // 防止编辑
        collapseBtn.setAttribute('data-collapse-btn', 'true'); // 标记为折叠按钮

        // 添加点击事件
        collapseBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleHeadingCollapse(heading, headingId!, collapseState);
        });

        // 将按钮插入到标题开头
        heading.insertBefore(collapseBtn, heading.firstChild);
      });
    } finally {
      isProcessing = false;
    }
  };

  // 监听编辑器内容变化
  const observer = new MutationObserver((mutations) => {
    // 检查是否有实际的内容变化（排除折叠按钮的添加）
    const hasContentChange = mutations.some((mutation) => {
      // 如果是折叠按钮的变化，忽略
      if (mutation.type === 'childList') {
        const addedNodes = Array.from(mutation.addedNodes);
        const isCollapseBtn = addedNodes.some((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            return (
              element.classList.contains('heading-collapse-btn') ||
              element.getAttribute('data-collapse-btn') === 'true'
            );
          }
          return false;
        });
        return !isCollapseBtn;
      }
      return true;
    });

    if (hasContentChange) {
      // 使用 setTimeout 避免在 mutation 回调中修改 DOM
      setTimeout(() => {
        addCollapseButtons();
      }, 0);
    }
  });

  observer.observe(editorElement, {
    childList: true,
    subtree: true,
  });

  // 初始化
  setTimeout(() => {
    addCollapseButtons();
  }, 100);

  // 返回清理函数
  return () => {
    observer.disconnect();
    // 清理所有折叠按钮
    const buttons = editorElement.querySelectorAll('.heading-collapse-btn');
    buttons.forEach((btn) => btn.remove());
  };
}

/**
 * 切换标题折叠状态
 */
function toggleHeadingCollapse(
  heading: Element,
  headingId: string,
  collapseState: HeadingCollapseState
) {
  try {
    const isCollapsed = collapseState[headingId] || false;
    const newState = !isCollapsed;
    collapseState[headingId] = newState;

    // 更新按钮图标
    const btn = heading.querySelector('.heading-collapse-btn i');
    if (btn) {
      btn.className = newState ? 'fas fa-chevron-right' : 'fas fa-chevron-down';
    }

    // 获取当前标题的级别
    const currentLevel = parseInt(heading.tagName.substring(1));

    // 验证级别是否有效
    if (isNaN(currentLevel) || currentLevel < 1 || currentLevel > 6) {
      console.warn('Invalid heading level:', heading.tagName);
      return;
    }

    // 查找需要折叠/展开的内容
    let nextElement = heading.nextElementSibling;
    const elementsToToggle: Element[] = [];

    // 限制最多查找 100 个元素，防止无限循环
    let count = 0;
    const maxElements = 100;

    while (nextElement && count < maxElements) {
      count++;

      // 如果遇到同级或更高级的标题，停止
      if (nextElement.tagName && nextElement.tagName.match(/^H[1-6]$/)) {
        const nextLevel = parseInt(nextElement.tagName.substring(1));
        if (!isNaN(nextLevel) && nextLevel <= currentLevel) {
          break;
        }
      }

      elementsToToggle.push(nextElement);
      nextElement = nextElement.nextElementSibling;
    }

    // 切换显示状态
    elementsToToggle.forEach((element) => {
      try {
        if (newState) {
          (element as HTMLElement).style.display = 'none';
          element.setAttribute('data-collapsed', 'true');
        } else {
          (element as HTMLElement).style.display = '';
          element.removeAttribute('data-collapsed');
        }
      } catch (err) {
        console.error('Error toggling element:', err);
      }
    });

    // 添加折叠状态类
    if (newState) {
      heading.classList.add('collapsed');
    } else {
      heading.classList.remove('collapsed');
    }
  } catch (error) {
    console.error('Error in toggleHeadingCollapse:', error);
  }
}

/**
 * 获取标题折叠状态
 */
export function getCollapseState(editorElement: HTMLElement): HeadingCollapseState {
  const state: HeadingCollapseState = {};
  const headings = editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach((heading) => {
    const headingId = heading.getAttribute('data-heading-id');
    if (headingId) {
      state[headingId] = heading.classList.contains('collapsed');
    }
  });

  return state;
}

/**
 * 恢复标题折叠状态
 */
export function restoreCollapseState(
  editorElement: HTMLElement,
  state: HeadingCollapseState
) {
  const headings = editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach((heading) => {
    const headingId = heading.getAttribute('data-heading-id');
    if (headingId && state[headingId]) {
      // 模拟点击折叠按钮
      const btn = heading.querySelector('.heading-collapse-btn');
      if (btn) {
        (btn as HTMLElement).click();
      }
    }
  });
}
