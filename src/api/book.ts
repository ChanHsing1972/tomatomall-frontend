import { axios } from "../utils/request";

// 书籍信息类型
export interface BookInfo {
  id: string;
  title: string;
  author: string;
  cover: string;
  introduction: string;
  totalChapters: number;
}

// 章节信息类型
export interface Chapter {
  id: string;
  title: string;
  order: number;
}

// 章节详情类型
export interface ChapterDetail extends Chapter {
  content: string;
  nextChapterId: string | null;
  prevChapterId: string | null;
}

// Mock 书籍数据
const mockBooks: BookInfo[] = [
  {
    id: "1",
    title: "番茄农场奇遇记",
    author: "红果先生",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
    introduction:
      "这是一部关于一个年轻人在番茄农场的奇妙冒险，他如何从一个普通的实习生成长为一名优秀的农场主的故事...",
    totalChapters: 12,
  },
  {
    id: "2",
    title: "编程的艺术",
    author: "代码大师",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646",
    introduction:
      "这本书深入浅出地介绍了编程的核心概念和实践技巧，适合所有水平的程序员阅读...",
    totalChapters: 10,
  },
];

// Mock 章节数据
const mockChapters: Record<string, ChapterDetail[]> = {
  "1": [
    {
      id: "1-1",
      title: "第一章 初来乍到",
      order: 1,
      content: generateLoremIpsum(3000),
      prevChapterId: null,
      nextChapterId: "1-2",
    },
    {
      id: "1-2",
      title: "第二章 农场规则",
      order: 2,
      content: generateLoremIpsum(3500),
      prevChapterId: "1-1",
      nextChapterId: "1-3",
    },
    {
      id: "1-3",
      title: "第三章 初识番茄",
      order: 3,
      content: generateLoremIpsum(4000),
      prevChapterId: "1-2",
      nextChapterId: "1-4",
    },
    {
      id: "1-4",
      title: "第四章 意外发现",
      order: 4,
      content: generateLoremIpsum(3800),
      prevChapterId: "1-3",
      nextChapterId: "1-5",
    },
    {
      id: "1-5",
      title: "第五章 田间冒险",
      order: 5,
      content: generateLoremIpsum(4200),
      prevChapterId: "1-4",
      nextChapterId: "1-6",
    },
    {
      id: "1-6",
      title: "第六章 丰收季节",
      order: 6,
      content: generateLoremIpsum(3700),
      prevChapterId: "1-5",
      nextChapterId: "1-7",
    },
    {
      id: "1-7",
      title: "第七章 烹饪艺术",
      order: 7,
      content: generateLoremIpsum(3900),
      prevChapterId: "1-6",
      nextChapterId: "1-8",
    },
    {
      id: "1-8",
      title: "第八章 市场营销",
      order: 8,
      content: generateLoremIpsum(4100),
      prevChapterId: "1-7",
      nextChapterId: "1-9",
    },
    {
      id: "1-9",
      title: "第九章 农场危机",
      order: 9,
      content: generateLoremIpsum(4500),
      prevChapterId: "1-8",
      nextChapterId: "1-10",
    },
    {
      id: "1-10",
      title: "第十章 转机",
      order: 10,
      content: generateLoremIpsum(4300),
      prevChapterId: "1-9",
      nextChapterId: "1-11",
    },
    {
      id: "1-11",
      title: "第十一章 奇迹",
      order: 11,
      content: generateLoremIpsum(3600),
      prevChapterId: "1-10",
      nextChapterId: "1-12",
    },
    {
      id: "1-12",
      title: "第十二章 新的开始",
      order: 12,
      content: generateLoremIpsum(4700),
      prevChapterId: "1-11",
      nextChapterId: null,
    },
  ],
  "2": [
    {
      id: "2-1",
      title: "第一章 编程的本质",
      order: 1,
      content: generateLoremIpsum(3200),
      prevChapterId: null,
      nextChapterId: "2-2",
    },
    {
      id: "2-2",
      title: "第二章 数据结构",
      order: 2,
      content: generateLoremIpsum(3400),
      prevChapterId: "2-1",
      nextChapterId: "2-3",
    },
    {
      id: "2-3",
      title: "第三章 算法思维",
      order: 3,
      content: generateLoremIpsum(3800),
      prevChapterId: "2-2",
      nextChapterId: "2-4",
    },
    {
      id: "2-4",
      title: "第四章 代码质量",
      order: 4,
      content: generateLoremIpsum(3600),
      prevChapterId: "2-3",
      nextChapterId: "2-5",
    },
    {
      id: "2-5",
      title: "第五章 测试驱动",
      order: 5,
      content: generateLoremIpsum(3300),
      prevChapterId: "2-4",
      nextChapterId: "2-6",
    },
    {
      id: "2-6",
      title: "第六章 性能优化",
      order: 6,
      content: generateLoremIpsum(3700),
      prevChapterId: "2-5",
      nextChapterId: "2-7",
    },
    {
      id: "2-7",
      title: "第七章 设计模式",
      order: 7,
      content: generateLoremIpsum(4000),
      prevChapterId: "2-6",
      nextChapterId: "2-8",
    },
    {
      id: "2-8",
      title: "第八章 架构设计",
      order: 8,
      content: generateLoremIpsum(4200),
      prevChapterId: "2-7",
      nextChapterId: "2-9",
    },
    {
      id: "2-9",
      title: "第九章 职业成长",
      order: 9,
      content: generateLoremIpsum(3500),
      prevChapterId: "2-8",
      nextChapterId: "2-10",
    },
    {
      id: "2-10",
      title: "第十章 编程哲学",
      order: 10,
      content: generateLoremIpsum(4100),
      prevChapterId: "2-9",
      nextChapterId: null,
    },
  ],
};

// 生成测试内容的辅助函数
function generateLoremIpsum(length: number): string {
  const paragraphs = [
    "<p>番茄书城是一个致力于为读者提供优质阅读体验的平台。在这里，我们精选各类书籍，包括文学、科技、历史、艺术等多个领域的精品内容，为读者打造一个丰富多彩的阅读世界。</p>",
    "<p>阅读是一种享受，也是一种成长。通过阅读，我们可以了解世界的多样性，拓展知识的边界，提升思维的深度和广度。在番茄书城，每一本书都是一扇通往新世界的窗口，每一页都蕴含着无限可能。</p>",
    "<p>我们相信，优质的阅读体验不仅仅是内容的质量，还包括阅读环境的舒适度。因此，我们精心设计了在线阅读器，提供多种阅读模式和个性化设置，让您的阅读过程更加顺畅和愉悦。</p>",
    "<p>在番茄书城，我们不仅是书籍的提供者，更是阅读文化的传播者。我们希望通过我们的平台，让更多人爱上阅读，享受阅读的乐趣，领略知识的魅力。</p>",
    "<p>阅读是一场旅行，而番茄书城就是您的指南。无论您是文学爱好者、科技迷、历史研究者还是艺术欣赏家，在这里，总能找到适合您的精神食粮。</p>",
    "<p>书籍是人类进步的阶梯，阅读是打开智慧之门的钥匙。在番茄书城，让我们一起踏上阅读的旅程，探索知识的海洋，感受文字的力量。</p>",
    "<p>知识改变命运，阅读点亮人生。番茄书城，与您一起品味阅读的美好，享受知识的盛宴。让我们在书籍的世界里，发现更好的自己。</p>",
  ];

  let result = "";
  while (result.length < length) {
    const randomParagraph =
      paragraphs[Math.floor(Math.random() * paragraphs.length)];
    result += randomParagraph;
  }

  // 添加一些格式化内容使阅读体验更丰富
  result += "<h3>番茄书城 - 阅读的艺术</h3>";
  result += "<blockquote>阅读是在别人思想的花园里散步 —— 雷蒙德</blockquote>";
  result += "<p><strong>在番茄书城，我们坚信：</strong></p>";
  result +=
    "<ul><li>优质的内容值得被更多人看到</li><li>舒适的阅读环境提升阅读体验</li><li>知识的传播能够改变世界</li></ul>";

  return result;
}

// 获取书籍列表
export function getBookList(): Promise<{
  data: { code: string; data: BookInfo[] };
}> {
  // 实际项目中这里会是真实的API调用
  // return axios.get('/api/books');

  // Mock版本
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          code: "200",
          data: mockBooks,
        },
      });
    }, 300);
  });
}

// 获取书籍详情
export function getBookDetail(
  bookId: string
): Promise<{ data: { code: string; data: BookInfo } }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const book = mockBooks.find((book) => book.id === bookId);
      if (book) {
        resolve({
          data: {
            code: "200",
            data: book,
          },
        });
      } else {
        resolve({
          data: {
            code: "404",
            data: {} as BookInfo,
          },
        });
      }
    }, 300);
  });
}

// 获取章节列表
export function getChapterList(
  bookId: string
): Promise<{ data: { code: string; data: Chapter[] } }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const chapters = mockChapters[bookId];
      if (chapters) {
        // 只返回不含content的章节信息
        const chapterList: Chapter[] = chapters.map(({ id, title, order }) => ({
          id,
          title,
          order,
        }));
        resolve({
          data: {
            code: "200",
            data: chapterList,
          },
        });
      } else {
        resolve({
          data: {
            code: "404",
            data: [],
          },
        });
      }
    }, 300);
  });
}

// 获取章节详情
export function getChapterDetail(
  bookId: string,
  chapterId: string
): Promise<{ data: { code: string; data: ChapterDetail } }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const chapters = mockChapters[bookId];
      if (chapters) {
        const chapter = chapters.find((chapter) => chapter.id === chapterId);
        if (chapter) {
          resolve({
            data: {
              code: "200",
              data: chapter,
            },
          });
        } else {
          resolve({
            data: {
              code: "404",
              data: {} as ChapterDetail,
            },
          });
        }
      } else {
        resolve({
          data: {
            code: "404",
            data: {} as ChapterDetail,
          },
        });
      }
    }, 300);
  });
}
