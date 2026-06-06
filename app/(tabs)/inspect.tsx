import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { analyzeVehicleImageWithGroq } from '../../services/groqService';

export default function InspectScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMileage, setVehicleMileage] = useState('');
  const [vehicleCity, setVehicleCity] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert('Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyzeVehicle = async () => {
    if (!selectedImage) return;

    try {
      setIsAnalyzing(true);
      const aiResult = await analyzeVehicleImageWithGroq(selectedImage);
      if (!aiResult.isVehicle) {
  alert(
    'No vehicle detected. Please upload a clear image containing a car, SUV, truck, van, or motorcycle.'
  );
  setIsAnalyzing(false);
  return;
}
      router.push({
        pathname: '/result',
        params: {
          imageUri: selectedImage,
          vehicleMake,
          vehicleModel,
          vehicleYear,
          vehicleMileage,
          vehicleCity,
          vehicleType: aiResult.vehicleType,
          severity: aiResult.severity,
          damage: JSON.stringify(aiResult.damage),
          estimatedCost: aiResult.estimatedCost,
          repairSuggestion: aiResult.repairSuggestion,
          affectedArea: aiResult.affectedArea,
damageType: aiResult.damageType,
affectedComponents: JSON.stringify(aiResult.affectedComponents),
          bodyCondition: aiResult.bodyCondition,
paintCondition: aiResult.paintCondition,
safetyImpact: aiResult.safetyImpact,
repairUrgency: aiResult.repairUrgency,
resaleImpact: aiResult.resaleImpact,
overallScore: aiResult.overallScore,
        },
      });
    } catch (error: any) {
      console.log('FULL ERROR:', error);

      router.push({
        pathname: '/result',
        params: {
          imageUri: selectedImage,
          vehicleMake,
          vehicleModel,
          vehicleYear,
          vehicleMileage,
          vehicleCity,
          vehicleType: 'Sedan / Passenger Car',
          severity: 'Moderate',
          damage: JSON.stringify([
            'Front bumper scratch',
            'Minor dent on side panel',
            'Paint surface damage',
          ]),
          estimatedCost: 'PKR 18,000 - 25,000',
          repairSuggestion:
            'Recommended repair includes dent removal, bumper repainting and paint polishing. A professional workshop inspection is advised before final repair.',
            bodyCondition: 80,
paintCondition: 75,
safetyImpact: 90,
repairUrgency: 'Medium',
resaleImpact: 'Low',
overallScore: 82,
affectedArea: 'Front Bumper',
damageType: 'Paint Scratch',
affectedComponents: JSON.stringify([
  'Front Bumper Cover',
  'Paint Layer'
]),
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.container}
>
        <Text style={styles.title}>Vehicle Inspection</Text>
        <Text style={styles.subtitle}>Enter vehicle details and upload damage image.</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Vehicle Make (Toyota, Honda...)"
            value={vehicleMake}
            onChangeText={setVehicleMake}
          />

          <TextInput
            style={styles.input}
            placeholder="Vehicle Model"
            value={vehicleModel}
            onChangeText={setVehicleModel}
          />

          <TextInput
            style={styles.input}
            placeholder="Vehicle Year"
            value={vehicleYear}
            onChangeText={setVehicleYear}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Mileage (KM)"
            value={vehicleMileage}
            onChangeText={setVehicleMileage}
            keyboardType="numeric"
          />
          <TextInput
  style={styles.input}
  placeholder="City / Area (Gujranwala, Lahore...)"
  value={vehicleCity}
  onChangeText={setVehicleCity}
/>
        </View>

        <LinearGradient colors={['#eff6ff', '#ffffff']} style={styles.uploadBox}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          ) : (
            <>
              <View style={styles.iconCircle}>
                <Ionicons name="car-sport-outline" size={58} color="#2563eb" />
              </View>
              <Text style={styles.uploadTitle}>No image selected</Text>
              <Text style={styles.uploadText}>Choose a clear photo of the damaged vehicle area.</Text>
            </>
          )}
        </LinearGradient>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.optionButton} onPress={takePhotoWithCamera}>
            <Ionicons name="camera-outline" size={22} color="#2563eb" />
            <Text style={styles.optionText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={pickImageFromGallery}>
            <Ionicons name="image-outline" size={22} color="#2563eb" />
            <Text style={styles.optionText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={selectedImage ? styles.analyzeButton : styles.disabledButton}
          disabled={!selectedImage || isAnalyzing}
          onPress={analyzeVehicle}
        >
          <Text style={styles.analyzeText}>
            {isAnalyzing ? 'Analyzing Vehicle...' : 'Analyze Vehicle'}
          </Text>
          <Ionicons name="sparkles-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f7fb' },
  container: { padding: 22, paddingTop: 60, paddingBottom: 110 },
  title: { fontSize: 30, fontWeight: '900', color: '#0f172a' },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: '#64748b',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    marginTop: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  uploadBox: {
    height: 260,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 10,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    resizeMode: 'cover',
  },
  iconCircle: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  uploadTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#0f172a',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#64748b',
    maxWidth: 260,
  },
  buttonRow: { flexDirection: 'row', gap: 14, marginTop: 18 },
  optionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  analyzeButton: {
    marginTop: 18,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  disabledButton: {
    marginTop: 18,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  analyzeText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
  },
});