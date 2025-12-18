import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi' as const, name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">{t('settings.language')}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              className={`h-auto py-3 px-4 justify-start ${
                language === lang.code ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
              onClick={() => setLanguage(lang.code)}
            >
              <span className="text-2xl mr-3">{lang.flag}</span>
              <div className="text-left">
                <p className="font-medium">{lang.nativeName}</p>
                <p className="text-xs text-muted-foreground">{lang.name}</p>
              </div>
              {language === lang.code && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSwitcher;
