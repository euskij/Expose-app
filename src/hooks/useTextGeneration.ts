import { useState } from 'react';

const useTextGeneration = () => {
    const [generatedText, setGeneratedText] = useState('');

    const generateText = async (input: string) => {
        try {
            const response = await fetch('https://api.example.com/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input }),
            });
            const data = await response.json();
            setGeneratedText(data.text);
        } catch (error) {
            console.error('Error generating text:', error);
        }
    };

    return { generatedText, generateText };
};

export default useTextGeneration;