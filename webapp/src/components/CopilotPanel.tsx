import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Input,
  Avatar,
  Button,
  Spinner,
} from "@fluentui/react-components";
import {
  Dismiss20Regular,
  Send20Regular,
} from "@fluentui/react-icons";
import { useState, useRef, useEffect } from "react";
import copilotIcon from "@/assets/copilot-icon.png";
import { apiClient } from "@/lib/api";
import type { ChatSuggestion } from "@/lib/api";

const useStyles = makeStyles({
  panel: {
    width: "380px",
    minWidth: "380px",
    height: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderLeft("1px", "solid", tokens.colorNeutralStroke2),
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    "@media (max-width: 768px)": {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      width: "100%",
      minWidth: "unset",
      zIndex: 1000,
      boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
      ...shorthands.borderLeft("0px", "solid", "transparent"),
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
    flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  iconWrap: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    backgroundColor: "#0f6cbd",
  },
  chatArea: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  messageBot: { display: "flex", gap: "10px", alignItems: "flex-start" },
  messageUser: { display: "flex", gap: "10px", alignItems: "flex-start", justifyContent: "flex-end" },
  messageBubble: {
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    borderRadius: "12px",
    backgroundColor: tokens.colorNeutralBackground1,
    padding: "12px 16px",
    maxWidth: "90%",
    lineHeight: "1.5",
    fontSize: "13px",
    whiteSpace: "pre-wrap",
  },
  messageBubbleUser: {
    borderRadius: "12px",
    backgroundColor: "#0f6cbd",
    color: "#fff",
    padding: "10px 14px",
    maxWidth: "80%",
    lineHeight: "1.5",
    fontSize: "13px",
  },
  suggestionGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "10px",
  },
  suggestionCard: {
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    fontSize: "12px",
    textAlign: "left",
    transition: "background-color 0.15s",
    ":hover": { backgroundColor: "#e8f0fe", ...shorthands.borderColor("#0f6cbd") },
  },
  inputBar: {
    display: "flex",
    gap: "8px",
    padding: "12px 20px",
    ...shorthands.borderTop("1px", "solid", tokens.colorNeutralStroke2),
    flexShrink: 0,
  },
});

const defaultSuggestions: ChatSuggestion[] = [
  { text: "Who on my team is at risk of burnout?" },
  { text: "Prepare my 1:1 with Alex Chen" },
  { text: "What are the top skill gaps?" },
  { text: "Show team wellbeing trend" },
];

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
}

interface CopilotPanelProps {
  open: boolean;
  onClose: () => void;
  teamId?: string;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({ open, onClose, teamId = "team1" }) => {
  const styles = useStyles();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>(defaultSuggestions);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open) return null;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text }]);
    setLoading(true);
    try {
      const response = await apiClient.copilotChat({ message: text, teamId, conversationId });
      setConversationId(response.conversationId);
      setMessages((prev) => [...prev, { id: response.conversationId + Date.now(), role: "bot", text: response.reply }]);
      if (response.suggestions.length > 0) setSuggestions(response.suggestions);
    } catch {
      setMessages((prev) => [...prev, { id: "err-" + Date.now(), role: "bot", text: "Sorry, I couldn't process that. Please check the backend connection and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <img src={copilotIcon} alt="Copilot" style={{ width: "24px", height: "24px" }} />
          </div>
          <div>
            <Text weight="semibold" size={400}>LogIQ Copilot</Text>
            <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: "block" }}>AI-powered assistant</Text>
          </div>
        </div>
        <Button appearance="subtle" icon={<Dismiss20Regular />} onClick={onClose} />
      </div>

      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <div className={styles.messageBot}>
            <Avatar name="C" size={28} style={{ backgroundColor: "#0f6cbd", color: "#fff" }} />
            <div className={styles.messageBubble}>
              <Text size={300} style={{ display: "block", marginBottom: "8px" }}>
                Hi! I'm your LogIQ Copilot. I can help you understand your team's health, prepare for 1:1s, and suggest actions.
              </Text>
              <div className={styles.suggestionGrid}>
                {suggestions.map((s) => (
                  <button key={s.text} className={styles.suggestionCard} onClick={() => sendMessage(s.text)}>{s.text}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className={styles.messageUser}>
              <div className={styles.messageBubbleUser}>{msg.text}</div>
            </div>
          ) : (
            <div key={msg.id} className={styles.messageBot}>
              <Avatar name="C" size={28} style={{ backgroundColor: "#0f6cbd", color: "#fff" }} />
              <div className={styles.messageBubble}>{msg.text}</div>
            </div>
          )
        )}

        {loading && (
          <div className={styles.messageBot}>
            <Avatar name="C" size={28} style={{ backgroundColor: "#0f6cbd", color: "#fff" }} />
            <div className={styles.messageBubble}><Spinner size="extra-tiny" label="Thinking..." /></div>
          </div>
        )}

        {messages.length > 0 && !loading && (
          <div className={styles.suggestionGrid}>
            {suggestions.slice(0, 2).map((s) => (
              <button key={s.text} className={styles.suggestionCard} onClick={() => sendMessage(s.text)}>{s.text}</button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className={styles.inputBar}>
        <Input
          placeholder="Ask Copilot..."
          value={input}
          onChange={(_, d) => setInput(d.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          style={{ flexGrow: 1 }}
          size="small"
        />
        <Button appearance="primary" icon={<Send20Regular />} size="small" onClick={() => sendMessage(input)} disabled={loading} />
      </div>
    </div>
  );
};
