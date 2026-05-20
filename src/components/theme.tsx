import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function ThemeSelect({ theme }: string) {
  return (
    <Select defaultValue={theme}>
      <SelectTrigger>
        <SelectValue placeholder="Тема" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
