import { useEffect } from 'react';

const useEventListener = (event, callback, options = false, target = document) => {
  useEffect(() => {
    target.addEventListener(event, callback, options);

    return () => target.removeEventListener(event, callback);
  }, [event, callback, options, target]);
};

export default useEventListener;
