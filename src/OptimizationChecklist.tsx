import { useState } from "react";
import { Clock, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const initialTasks = [
  { id: 1, task: "Thêm Meta Viewport", status: true, progress: 100, time: "2 phút", benefit: "Responsive 100% trên mobile" },
  { id: 2, task: "Title + Meta Description", status: true, progress: 100, time: "15 phút", benefit: "Tăng CTR từ Google" },
  { id: 3, task: "Thêm hình ảnh + Video + Alt text", status: false, progress: 60, time: "2-3 giờ", benefit: "Tăng thời gian on-page" },
  { id: 4, task: "Alt text cho ảnh & Accessibility", status: true, progress: 100, time: "30 phút", benefit: "SEO hình ảnh tốt hơn" },
  { id: 5, task: "Tối ưu Heading & Nội dung", status: false, progress: 85, time: "3-4 giờ", benefit: "Rank từ khóa dài dễ hơn" },
  { id: 6, task: "Thêm Link Social & CTA", status: true, progress: 100, time: "1 giờ", benefit: "Tăng lead từ social" },
  { id: 7, task: "Tích hợp Form Liên hệ", status: true, progress: 100, time: "1-2 giờ", benefit: "Thu thập lead thật" },
  { id: 8, task: "Tối ưu tốc độ & Performance", status: false, progress: 75, time: "1 giờ", benefit: "PageSpeed >90" },
  { id: 9, task: "Thêm Schema Markup (Person)", status: true, progress: 100, time: "45 phút", benefit: "Rich snippet đẹp" },
  { id: 10, task: "Tạo robots.txt + sitemap.xml", status: true, progress: 100, time: "30 phút", benefit: "Google index nhanh" },
  { id: 11, task: "Submit Google Search Console", status: false, progress: 0, time: "20 phút", benefit: "Biết traffic thực tế" },
  { id: 12, task: "Thêm Google Analytics 4", status: false, progress: 70, time: "15 phút", benefit: "Theo dõi dữ liệu" },
];

export default function OptimizationChecklist() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleCheck = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: !task.status, progress: !task.status ? 100 : 40 }
          : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 py-12 px-4 dark:bg-zinc-950">
      <Card className="max-w-7xl mx-auto shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="w-9 h-9 text-orange-500" />
            <CardTitle className="text-3xl font-bold">Bảng Thống Kê Tối Ưu Website</CardTitle>
            <Badge variant="outline" className="text-orange-600">
              Tâm Calisthenics
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">STT</TableHead>
                <TableHead>Nhiệm vụ</TableHead>
                <TableHead className="w-24 text-center">Trạng thái</TableHead>
                <TableHead className="w-44">Tiến độ</TableHead>
                <TableHead className="w-32 text-center">Thời gian</TableHead>
                <TableHead>Lợi ích</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-center">{task.id}</TableCell>
                  <TableCell className="font-medium">{task.task}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={task.status}
                      onCheckedChange={() => toggleCheck(task.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Progress value={task.progress} className="h-3" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {task.time}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.benefit}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
