//formats time from seconds to MM:SS
export default function formatSeconds (s) {
	return (isNaN(s) || s <= 0) ? '00:00' : `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

//formats time from milliseconds to MM:SS
export function formatMilliseconds (ms) {
	return formatSeconds(Math.floor(ms/1000));
}
