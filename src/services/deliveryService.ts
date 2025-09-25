import { supabase } from "@/integrations/supabase/client";

// Strategy Pattern for Notification Delivery
export interface DeliveryStrategy {
  deliver(alert: any, user: any): Promise<boolean>;
}

// In-App Delivery Strategy
export class InAppDeliveryStrategy implements DeliveryStrategy {
  async deliver(alert: any, user: any): Promise<boolean> {
    try {
      // Log the delivery in the database
      const { error } = await supabase
        .from('notification_deliveries')
        .insert({
          alert_id: alert.id,
          user_id: user.id,
          channel: 'inapp',
          delivered: true,
        });

      if (error) throw error;

      // Send real-time notification
      await supabase
        .channel('notifications')
        .send({
          type: 'broadcast',
          event: 'new_alert',
          payload: { alert, user }
        });

      return true;
    } catch (error) {
      console.error('In-app delivery failed:', error);
      return false;
    }
  }
}

// Email Delivery Strategy (Future implementation)
export class EmailDeliveryStrategy implements DeliveryStrategy {
  async deliver(alert: any, user: any): Promise<boolean> {
    // Future implementation for email delivery
    console.log('Email delivery not implemented yet');
    return false;
  }
}

// SMS Delivery Strategy (Future implementation)
export class SMSDeliveryStrategy implements DeliveryStrategy {
  async deliver(alert: any, user: any): Promise<boolean> {
    // Future implementation for SMS delivery
    console.log('SMS delivery not implemented yet');
    return false;
  }
}

// Delivery Manager using Strategy Pattern
export class DeliveryManager {
  private strategies: Map<string, DeliveryStrategy> = new Map();

  constructor() {
    this.strategies.set('inapp', new InAppDeliveryStrategy());
    this.strategies.set('email', new EmailDeliveryStrategy());
    this.strategies.set('sms', new SMSDeliveryStrategy());
  }

  async deliver(alert: any, user: any, channels: string[]): Promise<void> {
    for (const channel of channels) {
      const strategy = this.strategies.get(channel);
      if (strategy) {
        await strategy.deliver(alert, user);
      }
    }
  }

  // Add new delivery strategy
  addStrategy(channel: string, strategy: DeliveryStrategy): void {
    this.strategies.set(channel, strategy);
  }
}

export const deliveryManager = new DeliveryManager();