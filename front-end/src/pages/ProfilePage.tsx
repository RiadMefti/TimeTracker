import type { FC } from "react";
import {
  Box,
  Avatar,
  Typography,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { useUserStore } from "../stores/userStore";
import { getAuth } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { useEffect, useState } from "react";

const ProfilePage: FC = () => {
  const { authInitialized } = useUserStore();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setFirebaseUser(auth.currentUser);
  }, [authInitialized]);

  if (!authInitialized) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main" }} />
      </Box>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: "100%",
          backgroundColor: "#1a2c38",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            mt: 3,
            mb: 2,
          }}
        >
          <Avatar
            src={
              firebaseUser.photoURL ||
              (firebaseUser.providerData &&
                firebaseUser.providerData[0]?.photoURL) ||
              undefined
            }
            alt={firebaseUser.displayName || firebaseUser.email || "User"}
            sx={{
              width: 100,
              height: 100,
              border: "3px solid #0a7dff",
              backgroundColor: "#223139",
            }}
            slotProps={{
              img: {
                style: { objectFit: "cover" },
                referrerPolicy: "no-referrer",
                onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = "/timer.svg";
                },
              },
            }}
          />
        </Box>

        <Typography
          variant="h5"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            color: "#fff",
          }}
        >
          {firebaseUser.displayName || "No Name"}
        </Typography>

        <Typography
          variant="body1"
          align="center"
          sx={{
            mb: 2,
            color: "#b0b0b0",
          }}
        >
          {firebaseUser.email}
        </Typography>

        <Divider sx={{ width: "92%", mx: "auto", bgcolor: "#223139" }} />

        <CardContent sx={{ pt: 3 }}>
          <Box sx={{ px: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "#7c7c7c", mb: 0.5 }}>
              Google UID
            </Typography>
            <Typography
              variant="body2"
              sx={{ wordBreak: "break-all", color: "#b0b0b0", mb: 2 }}
            >
              {firebaseUser.uid}
            </Typography>

            <Typography variant="subtitle2" sx={{ color: "#7c7c7c", mb: 0.5 }}>
              Account Created
            </Typography>
            <Typography variant="body2" sx={{ color: "#b0b0b0", mb: 2 }}>
              {firebaseUser.metadata?.creationTime
                ? new Date(firebaseUser.metadata.creationTime).toLocaleString()
                : "-"}
            </Typography>

            <Typography variant="subtitle2" sx={{ color: "#7c7c7c", mb: 0.5 }}>
              Last Login
            </Typography>
            <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
              {firebaseUser.metadata?.lastSignInTime
                ? new Date(
                    firebaseUser.metadata.lastSignInTime
                  ).toLocaleString()
                : "-"}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
