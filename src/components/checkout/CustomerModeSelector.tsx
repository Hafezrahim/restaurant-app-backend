import React from 'react';
import { User, UserPlus } from 'lucide-react';

interface CustomerModeSelectorProps {
  onSelectGuest: () => void;
  onSelectReturning: () => void;
  hasStoredData: boolean;
}

export const CustomerModeSelector: React.FC<CustomerModeSelectorProps> = ({
  onSelectGuest,
  onSelectReturning,
  hasStoredData,
}) => {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card space-y-4">
      <h2 className="font-bold text-lg text-foreground text-center mb-4">
        مرحباً بك في مطعم مزاج
      </h2>
      <p className="text-muted-foreground text-center text-sm mb-6">
        كيف تريد إتمام طلبك؟
      </p>

      <div className="grid gap-3">
        {/* Returning Customer Option */}
        {hasStoredData && (
          <button
            onClick={onSelectReturning}
            className="w-full p-4 bg-primary/10 hover:bg-primary/20 border-2 border-primary rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-right flex-1">
                <h3 className="font-bold text-foreground">عميل مسجل</h3>
                <p className="text-sm text-muted-foreground">استخدم بياناتك المحفوظة</p>
              </div>
            </div>
          </button>
        )}

        {/* Guest Option */}
        <button
          onClick={onSelectGuest}
          className="w-full p-4 bg-muted/50 hover:bg-muted border-2 border-border hover:border-primary/50 rounded-2xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-right flex-1">
              <h3 className="font-bold text-foreground">زائر</h3>
              <p className="text-sm text-muted-foreground">أدخل بياناتك يدوياً</p>
            </div>
          </div>
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        سيتم حفظ بياناتك لتسهيل طلباتك القادمة
      </p>
    </div>
  );
};
