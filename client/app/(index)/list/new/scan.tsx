import { ThemedText } from "@/components/ThemedText";
import Button from "@/components/ui/button";
import { useJoinShoppingListCallback } from "@/stores/ShoppingListsStore";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function ScanQRCode() {
  const [permission, requestPermission] = useCameraPermissions();
  const joinShoppingListCallback = useJoinShoppingListCallback();
  const router = useRouter();
  const [qrCodeDetected, setQrCodeDetected] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.message}>
          We need your permission to show the camera
        </ThemedText>
        <Button onPress={requestPermission} variant="ghost">
          Grant permission
        </Button>
      </View>
    );
  }

  function handleConfirmJoinList() {
    joinShoppingListCallback(qrCodeDetected);
    if (router.canDismiss()) {
      router.dismiss();
    }
    router.push({
      pathname: "/list/[listId]",
      params: { listId: qrCodeDetected },
    });
  }

  function handleBarcodeScanned(barcodeScanningResult: BarcodeScanningResult) {
    const qrCodeUrl = barcodeScanningResult.data;

    if (qrCodeUrl.startsWith("https://shopping-list.expo.app/list/")) {
      const listId = qrCodeUrl.split("/list/")[1];
      setQrCodeDetected(listId);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setQrCodeDetected("");
      }, 1000);
    }
  }

  return (
    <CameraView
      style={styles.camera}
      facing="back"
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      onBarcodeScanned={handleBarcodeScanned}
    >
      <View style={styles.contentContainer}>
        {qrCodeDetected ? (
          <View style={styles.detectedContainer}>
            <ThemedText style={styles.detectedText} type="title">
              🥳 QR code detected!!!
            </ThemedText>
            <Button onPress={handleConfirmJoinList} variant="ghost">
              Join list
            </Button>
          </View>
        ) : (
          <ThemedText style={styles.instructionText} type="defaultSemiBold">
            Point the camera at a valid Shopping List QR Code
          </ThemedText>
        )}
      </View>
    </CameraView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detectedContainer: {
    backgroundColor: "black",
    borderRadius: 10,
    padding: 30,
  },
  detectedText: {
    color: "white",
    marginBottom: 16,
  },
  instructionText: {
    color: "white",
  },
});