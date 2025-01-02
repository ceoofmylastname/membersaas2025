import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const ChatWidget = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Create container for widget
    const container = document.createElement('div');
    container.id = 'chat-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    // Create and load widget script
    const script = document.createElement('script');
    script.src = 'https://agentivehub.com/production.bundle.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.apiKey = '06015a6d-4646-44dd-af5d-c7f11faa5bc6';
    script.dataset.assistantId = '5adba391-71e1-4eec-9453-359e115b5688';
    script.dataset.container = 'chat-widget-container';

    script.onload = () => {
      console.log('Chat widget loaded successfully');
    };

    script.onerror = (error) => {
      console.error('Error loading chat widget:', error);
      toast({
        variant: "destructive",
        title: "Error loading chat widget",
        description: "Please refresh the page to try again.",
      });
    };

    document.body.appendChild(script);

    // Cleanup function
    return () => {
      document.body.removeChild(container);
      const scriptElement = document.querySelector('script[src="https://agentivehub.com/production.bundle.min.js"]');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  return null;
};