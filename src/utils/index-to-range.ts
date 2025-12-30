// format
// 0010 => 0001_0100
// 0100 => 0001_0100
// 0101 => 0101_0200
// 0799 => 0701_0800
// 1000 => 0900_1000
// 1001 => 1001_1100
export function indexToRange(index: string) {
	const start = Math.floor((parseInt(index) - 1) / 100) * 100 + 1
	const end = (start + 99).toString().padStart(4, '0')
	return `${start.toString().padStart(4, '0')}_${end}`
}
