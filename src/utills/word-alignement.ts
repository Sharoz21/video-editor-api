function formatSrtTime(seconds) {
  const date = new Date(seconds * 1000);
  const pad = (n, z = 2) => ('00' + n).slice(-z);
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())},${pad(date.getUTCMilliseconds(), 3)}`;
}

function alignmentToSrt(alignmentJSON, maxWordsPerLine = 8) {
  const lines: string[] = [];
  const words = alignmentJSON.words.filter((w) => w.case === 'success');

  let counter = 1;
  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    const chunk = words.slice(i, i + maxWordsPerLine);
    const start = chunk[0].start;
    const end = chunk[chunk.length - 1].end;
    const text = chunk.map((w) => w.word).join(' ');

    lines.push(
      [
        counter++,
        `${formatSrtTime(start)} --> ${formatSrtTime(end)}`,
        text,
        '',
      ].join('\n'),
    );
  }

  return lines.join('\n');
}

export { alignmentToSrt };
