import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CALCULATOR_CONSTS_COLLECTION = 'calculatorConsts';

function getCalculatorConstsRef(calculatorId) {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  if (!calculatorId) {
    throw new Error('Missing calculator id.');
  }

  return doc(db, CALCULATOR_CONSTS_COLLECTION, calculatorId);
}

function watchCalculatorConsts(calculatorId, onData, onError) {
  const ref = getCalculatorConstsRef(calculatorId);

  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      onData(snapshot.data() || null);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
}

async function saveCalculatorConsts(calculatorId, values, updatedBy = '') {
  const ref = getCalculatorConstsRef(calculatorId);

  return setDoc(
    ref,
    {
      values,
      updatedBy,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export { saveCalculatorConsts, watchCalculatorConsts };