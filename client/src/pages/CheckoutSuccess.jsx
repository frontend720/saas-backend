import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { ME, MY_SUBSCRIPTION } from '../graphql/queries';

export default function CheckoutSuccess() {
  const client = useApolloClient();

  useEffect(() => {
    // Give webhook a moment to process, then bust the cache
    const t = setTimeout(() => {
      client.refetchQueries({ include: [ME, MY_SUBSCRIPTION] });
    }, 2000);
    return () => clearTimeout(t);
  }, [client]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-6">
      <div className="border-2 border-[#111111] bg-white shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] w-full max-w-md p-10 text-center">
        <div className="w-12 h-12 bg-[#FF4500] mx-auto mb-6 flex items-center justify-center">
          <span className="text-white font-bold text-xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-[#111111] uppercase mb-2">Upgrade Complete</h1>
        <p className="font-mono text-sm text-[#111111]/60 mb-8">
          Your account has been upgraded. New limits are active immediately.
        </p>
        <Link
          to="/"
          className="inline-block py-3 px-8 bg-[#FF4500] text-white font-bold uppercase text-sm border border-[#111111] shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:shadow-none active:translate-y-1 active:translate-x-1 hover:bg-[#111111] transition-colors"
        >
          Back to Capsules
        </Link>
      </div>
    </div>
  );
}
