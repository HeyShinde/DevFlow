# Settings & Configuration

DevFlow offers several settings to customize its behavior. You can access these settings via VS Code's settings UI or by editing your `settings.json`.

---

## Extension Settings

| Setting                  | Default                  | Description                                  |
|--------------------------|--------------------------|----------------------------------------------|
| `devflow.apiUrl`         | http://localhost:8000/api | DevFlow backend API URL                      |
| `devflow.defaultLimit`   | 5                        | Default number of results to return from queries (1-50) |

---

## AI Settings (Sidebar UI)

- **OpenAI API Key**: Enter your key to enable advanced AI answers.
- **Model**: Choose the OpenAI model (e.g., `gpt-4.1-nano`).
- **Token Limit**: Set the maximum number of tokens for AI responses (256-32768).

Below is the "AI Settings" tab in the sidebar:

<p align="center">
  <img src="../media/Settings.png" alt="AI Settings" style="height:120px; width:auto; max-width:120px; object-fit:cover; border-radius:8px; box-shadow:0 2px 8px #0002;" />
</p>

---

## How to Change Settings

- Open the command palette and search for `Preferences: Open Settings (UI)`.
- Search for "DevFlow" to see all available settings.
- Or, edit your `settings.json` directly:
  ```json
  {
    "devflow.apiUrl": "http://localhost:8000/api",
    "devflow.defaultLimit": 5
  }
  ```

---

## Tips

- Adjust `defaultLimit` for more or fewer results in search/AI queries.
- Change `apiUrl` if running the backend on a different host or port.
- Use the sidebar "AI Settings" tab for quick changes to AI-related options. 