interface ErrorMessageProps {
    error: string | null;
  }
  
  const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
    return error ? <p className="text-red-400 mt-4">{error}</p> : null;
  };
  
  export default ErrorMessage;
  