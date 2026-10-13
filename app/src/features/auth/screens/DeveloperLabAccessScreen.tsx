import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { API_BASE } from "../../../config/api";
import { getAdminToken, setAdminToken } from "../../../config/adminSession";
import LabDeveloperScreen from "../../lab/screens/LabDeveloperScreen";

export default function DeveloperLabAccessScreen() {
  const navigation = useNavigation<any>();
  const [token, setToken] = useState(getAdminToken());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (token) return <LabDeveloperScreen />;

  async function handleSignIn() {
    if (!username.trim() || !password) {
      setError("Enter the admin username and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.token) {
        setError(response.status === 401 ? "Admin credentials weren’t accepted." : "Could not sign in. Try again.");
        return;
      }

      setAdminToken(String(payload.token));
      setToken(String(payload.token));
      setPassword("");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>ADMIN ACCESS</Text>
        <Text style={styles.title}>Developer Lab</Text>
        <Text style={styles.description}>
          Sign in with the configured admin account to collect training data and manage models.
        </Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Admin username"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Admin password"
          secureTextEntry
          textContentType="password"
          onSubmitEditing={handleSignIn}
          editable={!loading}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.submit, loading && styles.submitDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Sign in</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F5F6F8",
  },
  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    gap: 14,
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  backButton: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: { color: "#6B7280", fontSize: 15, fontWeight: "700" },
  eyebrow: { color: "#E66E19", fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: "#111827", fontSize: 28, fontWeight: "800" },
  description: { color: "#6B7280", fontSize: 15, lineHeight: 22, marginBottom: 4 },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  error: { color: "#B91C1C", fontSize: 14 },
  submit: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#E66E19",
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
