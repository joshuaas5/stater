import { useRoutePreloading } from '@/hooks/useRoutePreloading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Download, Eye, Clock } from 'lucide-react';

export const LazyLoadingDemo = () => {
  const { preloadOnHover } = useRoutePreloading();

  const demoRoutes = [
    {
      path: '/financial-advisor',
      title: 'Financial Advisor',
      description: 'AI-powered financial advice',
      icon: <Zap className="h-4 w-4" />
    },
    {
      path: '/analise-financeira',
      title: 'Financial Analysis',
      description: 'Detailed financial analysis',
      icon: <Eye className="h-4 w-4" />
    },
    {
      path: '/export-report',
      title: 'Export Report',
      description: 'Generate and download reports',
      icon: <Download className="h-4 w-4" />
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Lazy Loading Demo
        </CardTitle>
        <CardDescription>
          Hover over the buttons below to see lazy loading in action. Routes are preloaded on hover for instant navigation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {demoRoutes.map((route) => (
          <Button
            key={route.path}
            variant="outline"
            className="w-full justify-start"
            asChild
          >
            <a
              href={route.path}
              {...preloadOnHover(route.path)}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              {route.icon}
              <div className="text-left">
                <div className="font-medium">{route.title}</div>
                <div className="text-sm text-muted-foreground">{route.description}</div>
              </div>
            </a>
          </Button>
        ))}
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Performance Features
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Routes load only when needed (lazy loading)</li>
            <li>• Critical routes preloaded after authentication</li>
            <li>• Hover preloading for instant navigation</li>
            <li>• Intelligent code splitting by feature</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
