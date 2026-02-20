import Chatbot from "@/components/Chatbot";

export default function ChatPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3">Assistant O-Flyes ✈️</h1>
        <p className="text-gray-400">
          Décrivez vos envies et je vous trouve la destination idéale. Dites-moi votre budget,
          ce que vous aimez, et quand vous voulez partir.
        </p>
      </div>
      <Chatbot />
    </div>
  );
}
