export default function LoadingIndicator({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="loading-spinner h-12 w-12 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
} 