import { useState } from "react";
import api, { setAccessToken } from "./api";

type LoginResp = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; username: string };
};

type FileDto = {
  id: string;
  displayName: string;
  originalName: string;
  mimeType: string;
  size: string;
};

export default function App() {
  const [username, setUsername] = useState("bart");
  const [password, setPassword] = useState("password");
  const [files, setFiles] = useState<FileDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    setError(null);
    try {
      const { data } = await api.post<LoginResp>("/auth/login", {
        username,
        password,
      });
      setAccessToken(data.accessToken);
      await loadFiles();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Login failed");
    }
  };

  const loadFiles = async () => {
    setError(null);
    try {
      const { data } = await api.get<FileDto[]>("/files");
      setFiles(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load files");
    }
  };

  return (
    <div
      style={{ maxWidth: 560, margin: "40px auto", fontFamily: "system-ui" }}
    >
      <h1>Test UI</h1>

      <section
        style={{
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <h2>Login</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
          <button onClick={login}>Sign in</button>
        </div>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </section>

      <section
        style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}
      >
        <h2>Files</h2>
        {!files && <p>Login first, then load files.</p>}
        {files && files.length === 0 && <p>No files.</p>}
        {files && files.length > 0 && (
          <ul>
            {files.map((f) => (
              <li key={f.id}>
                <strong>{f.displayName}</strong>{" "}
                <small>({f.originalName})</small> — {f.mimeType} — {f.size}{" "}
                bytes
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
