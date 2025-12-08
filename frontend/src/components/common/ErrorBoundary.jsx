import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(_error, _errorInfo) {
    // no-op in production
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-500 bg-red-100 border border-red-300 rounded-xl m-8">
          <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
          <p>
            We're sorry, but there was an error loading this component. Please
            try again later.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
