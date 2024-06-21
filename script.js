const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let uBitDevice;
let rxCharacteristic;

async function connectButtonPressed() {
  console.log('connecting')
  try {
    /**
     * Request Bluetooth Connection
     */
    uBitDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: [UART_SERVICE_UUID]
    });

    /**
     * Add listener when bluetooth disconnected
     */
    uBitDevice.addEventListener('gattserverdisconnected', onDisconnected);


    /**
     * Connect to GATT Server (Generic ATTribute)
     */
    console.log("Connecting to GATT Server...");
    const server = await uBitDevice.gatt.connect();

    /**
     * Getting service
     */
    console.log("Getting Service...");
    const service = await server.getPrimaryService(UART_SERVICE_UUID);

    /**
     * Getting Characteristic
     */
    console.log("Getting Characteristics...");
    const txCharacteristic = await service.getCharacteristic(
      UART_TX_CHARACTERISTIC_UUID
    );
    txCharacteristic.startNotifications();
    txCharacteristic.addEventListener(
      "characteristicvaluechanged",
      onTxCharacteristicValueChanged
    );
    rxCharacteristic = await service.getCharacteristic(
      UART_RX_CHARACTERISTIC_UUID
    );

    // update connection button to connected
    document.getElementById('connect').classList.add("connected");
  } catch (error) {
    console.log(error);
  }
}

/**
 * Disconnect bluettoth
 * @returns void
 */
function disconnectButtonPressed() {
  if (!uBitDevice) {
    return;
  }

  if (uBitDevice.gatt.connected) {
    uBitDevice.gatt.disconnect();
    console.log("Disconnected");
  }
}

/**
 * Send Data
 * @param num
 */
async function sendUART(num) {

  console.log(num)

  let encoder = new TextEncoder();
  queueGattOperation(() => rxCharacteristic.writeValue(encoder.encode(num+"\n"))
      .then(() => console.log("WRITE"))
      .catch(error => console.error('Błąd podczas wysyłania danych:', error)));
}



let queue = Promise.resolve();

function queueGattOperation(operation) {
   queue = queue.then(operation, operation);
   return queue;
}

function onTxCharacteristicValueChanged(event) {
  let receivedData = [];
  for (var i = 0; i < event.target.value.byteLength; i++) {
    receivedData[i] = event.target.value.getUint8(i);
  }

  const receivedString = String.fromCharCode.apply(null, receivedData);
  console.log(receivedString);
  if (receivedString === "S") {
    console.log("Shaken!");
  }
}



function onDisconnected(event) {
  let device = event.target;
  console.log(`Device ${device.name} is disconnected.`);
  document.getElementById('connect').classList.remove("connected");
}


function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}