import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function Theme({ defaultTheme, setDefaultTheme }: any) {
  return (
    <div className="flex items-center gap-1">
      <span>Тема</span>
      <Select defaultValue={defaultTheme} onValueChange={setDefaultTheme}>
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
    </div>
  );
}
