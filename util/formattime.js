//formats time from milliseconds to MM:SS
export default function formatMilliseconds(ms) {
	const s = Math.floor(ms/1000);
	const m = Math.floor(ms/60000);
	return (isNaN(s) || s <= 0) ? '00:00' : `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}
