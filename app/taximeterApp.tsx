import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


interface TaximeterState {
  isRunning: boolean;
  currentFare: number;
  distanceKm: number;
  timeElapsedSeconds: number;
  timeStoppedSeconds: number;
  isCarMoving: boolean;
  showResetModal: boolean;
  initialFare: string;
  farePerKmBand1: string;
  farePerKmBand2: string;
  farePerMinuteStopped: string;
  currentBand: number;
  
}

const TaximeterApp: React.FC = () => {
  // Variáveis do taxímetro
  const [isRunning, setIsRunning] = useState<boolean>(false); 
  const [currentFare, setCurrentFare] = useState<number>(0); 
  const [distanceKm, setDistanceKm] = useState<number>(0); 
  const [timeElapsedSeconds, setTimeElapsedSeconds] = useState<number>(0); 
  const [timeStoppedSeconds, setTimeStoppedSeconds] = useState<number>(0); 
  const [isCarMoving, setIsCarMoving] = useState<boolean>(true); 
  const [showResetModal, setShowResetModal] = useState<boolean>(false); 

  // Configurações de tarifa
  const [initialFare, setInitialFare] = useState<string>('5.00'); 
  const [farePerKmBand1, setFarePerKmBand1] = useState<string>('2.50'); 
  const [farePerKmBand2, setFarePerKmBand2] = useState<string>('3.20'); 
  const [farePerMinuteStopped, setFarePerMinuteStopped] = useState<string>('0.50'); 
  const [currentBand, setCurrentBand] = useState<number>(1); 

  //intervalo do timer, para poder limpá-lo
  const intervalRef = useRef<any>(null);

  //  simulação de velocidade (km/h)
  const simulatedSpeedKmPerHour: number = 30;

  // converter  (com vírgula) para números 
  const getParsedFare = (value: string): number => {
    // Substitui vírgula por ponto  e retorna 0 se for inválido
    const parsed = parseFloat(value.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed; //  retorna 0 para entradas inválidas
  };

  //  timer da corrida
  useEffect(() => {
    if (isRunning) {
      
      intervalRef.current = setInterval(() => {
        setTimeElapsedSeconds(prevTime => prevTime + 1); // Incrementa o tempo total

        if (isCarMoving) {
          // Se o carro estiver em movimento, incrementa a distância
          // (velocidade em km/h convertida para km/segundo)
          setDistanceKm(prevDistance => prevDistance + (simulatedSpeedKmPerHour / 3600));
        } else {
          // Se o carro estiver parado, incrementa o tempo parado
          setTimeStoppedSeconds(prevTime => prevTime + 1);
        }
      }, 1000); 
    } else {
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isCarMoving]); 


  useEffect(() => {
    const parsedInitialFare: number = getParsedFare(initialFare);
    // Seleciona por km baseada na bandeira atual
    const parsedFarePerKm: number = currentBand === 1 ? getParsedFare(farePerKmBand1) : getParsedFare(farePerKmBand2);
    const parsedFarePerMinuteStopped: number = getParsedFare(farePerMinuteStopped);

    // Calcula o valor da corrida com  distância e tempo parado
    const fareFromDistance: number = distanceKm * parsedFarePerKm;
    const fareFromTimeStopped: number = (timeStoppedSeconds / 60) * parsedFarePerMinuteStopped;

    // Atualiza o valor total da corrida
    setCurrentFare(parsedInitialFare + fareFromDistance + fareFromTimeStopped);
  }, [distanceKm, timeStoppedSeconds, currentBand, initialFare, farePerKmBand1, farePerKmBand2, farePerMinuteStopped]); 

  //  botão de Iniciar/Parar a corrida
  const handleStartStop = (): void => {
    //  define a bandeirada inicial
    if (!isRunning && currentFare === 0) {
      setCurrentFare(getParsedFare(initialFare));
    }
    setIsRunning(prev => !prev); 
  };

  // botão de Reiniciar a corrida
  const handleReset = (): void => {
    setShowResetModal(true); 
  };

  // reinício da corrida
  const confirmReset = (): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); 
    }
    setIsRunning(false); // Para a corrida
    setCurrentFare(0); // Zera o valor
    setDistanceKm(0); // Zera a distância
    setTimeElapsedSeconds(0); // Zera o tempo total
    setTimeStoppedSeconds(0); // Zera o tempo parado
    setIsCarMoving(true); //  estado de movimento 
    setCurrentBand(1); // Bandeira 1
    setShowResetModal(false); // Esconde o modal
  };

  // Cancela o reinício da corrida
  const cancelReset = (): void => {
    setShowResetModal(false); // Esconde o modal
  };

  //botão de Mudar Bandeira
  const handleToggleBand = (): void => {
    setCurrentBand(prevBand => (prevBand === 1 ? 2 : 1)); // Alterna entre Bandeira 1 e 2
  };

  // Lida com o botão de Simular Movimento/Parada
  const handleToggleMovement = (): void => {
    setIsCarMoving(prev => !prev); 
  };

 
  const formatTime = (totalSeconds: number): string => {
    const minutes: number = Math.floor(totalSeconds / 60);
    const seconds: number = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Taxímetro</Text>
        </View>

        
        <View style={styles.fareDisplay}>
          <Text style={styles.fareLabel}>Valor da Corrida:</Text>
          <Text style={styles.fareValue}>R$ {currentFare.toFixed(2).replace('.', ',')}</Text>
        </View>

        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Distância: {distanceKm.toFixed(2).replace('.', ',')} km</Text>
          <Text style={styles.infoText}>Tempo Total: {formatTime(timeElapsedSeconds)}</Text>
          <Text style={styles.infoText}>Tempo Parado: {formatTime(timeStoppedSeconds)}</Text>
          <Text style={styles.infoText}>Bandeira Atual: {currentBand}</Text>
          <Text style={styles.infoText}>Status: {isRunning ? (isCarMoving ? 'Rodando' : 'Parado no Trânsito') : 'Livre'}</Text>
        </View>

        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isRunning ? styles.buttonStop : styles.buttonStart]}
            onPress={handleStartStop}
          >
            <Text style={styles.buttonText}>{isRunning ? 'Parar Corrida' : 'Iniciar Corrida'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonToggleBand]}
            onPress={handleToggleBand}
            disabled={!isRunning}
          >
            <Text style={styles.buttonText}>Mudar Bandeira ({currentBand === 1 ? '2' : '1'})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isCarMoving ? styles.buttonSimulateStop : styles.buttonSimulateMove]}
            onPress={handleToggleMovement}
            disabled={!isRunning}
          >
            <Text style={styles.buttonText}>{isCarMoving ? 'Simular Parada' : 'Simular Movimento'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonReset]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>

        
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Configurações de Tarifa</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Bandeirada (R$):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={initialFare}
              onChangeText={setInitialFare}
              placeholder="Ex: 5.00"
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Valor/Km (Bandeira 1 - R$):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={farePerKmBand1}
              onChangeText={setFarePerKmBand1}
              placeholder="Ex: 2.50"
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Valor/Km (Bandeira 2 - R$):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={farePerKmBand2}
              onChangeText={setFarePerKmBand2}
              placeholder="Ex: 3.20"
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Valor/Min Parado (R$):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={farePerMinuteStopped}
              onChangeText={setFarePerMinuteStopped}
              placeholder="Ex: 0.50"
            />
          </View>
        </View>

        
        <Modal
          animationType="fade"
          transparent={true}
          visible={showResetModal}
          onRequestClose={cancelReset} 
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reiniciar Taxímetro</Text>
              <Text style={styles.modalMessage}>Tem certeza que deseja reiniciar a corrida? Todos os dados serão perdidos.</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  onPress={cancelReset}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirm]}
                  onPress={confirmReset}
                >
                  <Text style={styles.modalButtonText}>Reiniciar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fccb42',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fccb42',
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  fareDisplay: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8, 
  },
  fareLabel: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  fareValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'black',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 12,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonStart: {
    backgroundColor: '#27ae60', 
  },
  buttonStop: {
    backgroundColor: '#e74c3c', 
  },
  buttonToggleBand: {
    backgroundColor: '#3498db',
  },
  buttonSimulateStop: {
    backgroundColor: '#f39c12', 
  },
  buttonSimulateMove: {
    backgroundColor: '#1abc9c', 
  },
  buttonReset: {
    backgroundColor: '#95a5a6', 
  },
  settingsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 16,
    color: '#34495e',
    flex: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#ecf0f1',
    flex: 1,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
    color: '#34495e',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancel: {
    backgroundColor: '#95a5a6',
  },
  modalConfirm: {
    backgroundColor: '#e74c3c',
  },
});

export default TaximeterApp;
