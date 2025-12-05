
import { GoogleGenAI } from "@google/genai";
import { Subject, QuizQuestion, TypingChallenge, Poem, Lesson } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

// Helper to prevent "Uncaught SyntaxError" if AI returns Markdown code blocks
const cleanAndParseJSON = (text: string) => {
  try {
    // Remove ```json, ```, and trim whitespace
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Sometimes AI adds text before the JSON, try to find the first [ or {
    const firstBracket = clean.indexOf('[');
    const firstBrace = clean.indexOf('{');
    let startIndex = -1;
    
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        startIndex = firstBracket;
    } else if (firstBrace !== -1) {
        startIndex = firstBrace;
    }

    if (startIndex !== -1) {
        clean = clean.substring(startIndex);
    }

    // Find the last ] or } to cut off any trailing text
    const lastBracket = clean.lastIndexOf(']');
    const lastBrace = clean.lastIndexOf('}');
    let endIndex = -1;

    if (lastBracket !== -1 && (lastBrace === -1 || lastBracket > lastBrace)) {
        endIndex = lastBracket + 1;
    } else if (lastBrace !== -1) {
        endIndex = lastBrace + 1;
    }

    if (endIndex !== -1) {
        clean = clean.substring(0, endIndex);
    }

    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Error", e);
    console.log("Raw text was:", text);
    return null;
  }
};

const getGradePrompt = (grade: number) => {
    if (grade === 1) return "Pre-school / Kindergarten level (ages 4-6). Focus on ABCs, Numbers 1-10, Colors, Shapes, Animals, and very simple words.";
    if (grade === 2) return "Grade 2 level (ages 7-8). Simple sentences, basic addition/subtraction, nature.";
    return `Grade ${grade} curriculum level.`;
}

export const generateQuiz = async (subject: Subject, grade: number): Promise<QuizQuestion[]> => {
  try {
    const prompt = `Generate 5 multiple choice questions for ${subject} for a student in ${getGradePrompt(grade)}.
    Return purely a JSON array. No markdown.
    Format:
    [
      {
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "The correct option text",
        "explanation": "Simple explanation for a child"
      }
    ]`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const data = cleanAndParseJSON(response.text);
    return data || [];
  } catch (error) {
    console.error("Quiz Error:", error);
    return [];
  }
};

export const generateTypingContent = async (subject: Subject, grade: number): Promise<TypingChallenge | null> => {
  try {
    const prompt = `Write a short, fun, educational paragraph about ${subject} for a student in ${getGradePrompt(grade)}.
    Max 30 words for Grade 1-2, max 60 words for Grade 3+.
    Return purely a JSON object. No markdown.
    Format:
    {
      "text": "The text content...",
      "topic": "Title",
      "difficulty": "Easy"
    }`;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Typing Error:", error);
    return null;
  }
};

export const generatePoem = async (grade: number): Promise<Poem | null> => {
    try {
        const prompt = `Write a fun, rhythmic, catchy rhyming poem for a kid in ${getGradePrompt(grade)}.
        It should be about a random fun topic (Space, Animals, Magic, Friends).
        Include sound words (Onomatopoeia) like "Zoom", "Boom", "Splash".
        Return purely a JSON object. No markdown.
        Format:
        {
          "title": "Fun Title",
          "content": "Line 1\nLine 2...",
          "theme": "Space"
        }`;
    
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
    
        return cleanAndParseJSON(response.text);
    } catch (error) {
        console.error("Poem Error:", error);
        return null;
    }
};

export const generateLesson = async (subject: Subject, grade: number): Promise<Lesson | null> => {
  try {
    const prompt = `Write a short, fun, and engaging mini-lesson about a random interesting topic in ${subject} for a student in ${getGradePrompt(grade)}.
    Keep it under 100 words. Make it sound exciting!
    Also provide one "Did you know?" fun fact and a list of 3-5 key words to learn.
    Return purely a JSON object. No markdown.
    Format:
    {
      "title": "Exciting Topic Title",
      "content": "The educational content...",
      "funFact": "Did you know that...",
      "keyWords": ["Word1", "Word2", "Word3"]
    }`;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("Lesson Error:", error);
    return null;
  }
};

export const getChatResponse = async (userMessage: string, grade: number): Promise<string> => {
    try {
        const prompt = `You are 'Robo', a friendly, funny robot friend for a child in ${getGradePrompt(grade)}.
        The child says: "${userMessage}".
        Reply in 1 or 2 short, simple sentences. Be encouraging and use an emoji.
        If they say hello, introduce yourself as Robo.`;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });

        return response.text || "I am thinking... beep boop!";
    } catch (error) {
        return "My circuits are busy! Try again.";
    }
};