import { useEffect, useState } from "react";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReportsSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("reports");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const reports = [
    {
      title: "Impact Report",
      description: "Comprehensive environmental impact analysis with carbon metrics",
      type: "PDF",
      icon: FileText,
      size: "2.4 MB"
    },
    {
      title: "Analytics Sheet",
      description: "Detailed data export with sensor readings and trends",
      type: "Excel",
      icon: FileSpreadsheet,
      size: "1.8 MB"
    },
  ];

  return (
    <section id="reports" className="py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Export & Reports
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Download comprehensive reports for stakeholder communication
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reports.map((report, index) => (
            <div
              key={report.title}
              className={`glass-card rounded-3xl p-10 hover-lift shadow-premium transition-all duration-700 border border-border bg-white/90 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-6 mb-6">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <report.icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-foreground">{report.title}</h3>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                      {report.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <span className="text-sm text-muted-foreground font-light">{report.size}</span>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 font-medium transition-all duration-300 shadow-premium hover:shadow-float"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReportsSection;
