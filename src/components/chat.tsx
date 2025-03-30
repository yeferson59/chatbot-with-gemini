"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { generateMessage } from "@/actions/gemini";
import { Message } from "@/interfaces/message";
import { ExpandableMessage } from "./enabledMessage";
import { ImageUpload } from "./ImageUpload";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve((reader.result as string).split(",")[1] || "");
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inputText.trim() === "" && !image) return;

    setIsLoading(true);

    const newUserMessage: Message = {
      sender: "user",
      text: inputText,
      image: image ? URL.createObjectURL(image) : undefined,
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    let base64Image: string | null = null;
    if (image) {
      base64Image = await convertFileToBase64(image);
    }

    try {
      const botResponse: Message = {
        sender: "bot",
        text: await generateMessage(inputText, base64Image, image?.type || ""),
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error("Error generating message:", error);
      const errorMessage: Message = {
        sender: "bot",
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInputText("");
    setImage(null);
    setIsLoading(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
      <CardHeader className="shrink-0 border-b">
        <CardTitle>Chat con Bot</CardTitle>
      </CardHeader>
      <CardContent className="grow overflow-hidden flex flex-col p-0">
        <ScrollArea className="grow overflow-y-auto px-4" ref={scrollRef}>
          <div className="py-4 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } gap-3`}
              >
                {message.sender === "bot" && (
                  <Avatar className="shrink-0 mt-1">
                    <AvatarImage src="/bot-avatar.png" alt="Bot" />
                    <AvatarFallback>Bot</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`${
                    message.sender === "user"
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  } p-4 rounded-lg shadow-sm overflow-hidden max-w-[85%] md:max-w-[75%]`}
                >
                  <ExpandableMessage message={message} />
                  {message.image && (
                    <Image
                      src={message.image}
                      alt="Uploaded"
                      className="mt-2 max-w-full h-auto rounded-md"
                      width={300}
                      height={300}
                    />
                  )}
                </div>
                {message.sender === "user" && (
                  <Avatar className="shrink-0 mt-1">
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback>User</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="shrink-0 p-4 border-t bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="grow min-h-[2.5rem] max-h-[150px]"
                rows={1}
              />
              <Button type="submit" className="shrink-0" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
            <ImageUpload
              onImageSelect={(file) => setImage(file)}
              selectedImage={image}
            />
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
