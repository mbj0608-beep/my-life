
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiEventResponse } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateYearEvent = async (state: GameState): Promise<GeminiEventResponse> => {
  const prompt = `
    你是一个人生模拟游戏的主持人。
    当前玩家状态：
    年龄：${state.age}岁
    性别：${state.gender}
    属性：健康${state.stats.health}, 智力${state.stats.intelligence}, 魅力${state.stats.charm}, 快乐${state.stats.happiness}
    存款：${state.money}元
    职业：${state.job}
    教育：${state.education}
    关系：${state.relationships.map(r => r.relation + r.name).join(', ')}

    请生成一个适合该年龄段的随机人生事件。
    事件应该是有趣的、写实的，并提供3个选项。
    每个选项应该有对属性或金钱的影响。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                impactDescription: { type: Type.STRING },
                statsImpact: {
                  type: Type.OBJECT,
                  properties: {
                    health: { type: Type.NUMBER },
                    intelligence: { type: Type.NUMBER },
                    charm: { type: Type.NUMBER },
                    happiness: { type: Type.NUMBER },
                    money: { type: Type.NUMBER }
                  }
                },
                storyResult: { type: Type.STRING }
              },
              required: ["text", "impactDescription", "statsImpact", "storyResult"]
            }
          }
        },
        required: ["title", "description", "options"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateLifeSummary = async (state: GameState): Promise<string> => {
  const prompt = `
    玩家已经去世。请根据以下人生轨迹写一段深情、幽默且富有哲理的人生总结：
    名字：${state.name}
    享年：${state.age}岁
    最终资产：${state.money}元
    职业生涯：${state.job}
    人生大事记：${state.history.join('; ')}
    死亡原因：${state.deathReason}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text || "他/她静静地离开了这个世界。";
};
