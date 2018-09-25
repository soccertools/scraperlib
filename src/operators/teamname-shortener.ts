export function teamnameShortener(name: string, blacklist: string[] = [], aliases?: { [teamName: string]: string; } ) {
    const minLength = 4;

    // prefer using aliases if one exists
    if (aliases && aliases[name]) {
      return aliases[name];
    }

    // remove arabic numbers
    let parts = name.split(' ').filter(
      (part) => Number.isNaN(Number.parseInt(part)),
    );

    // find prefixes
    let start = 0;
    for (const part of parts) {
      if (
        part.length < minLength ||
        (part.length > minLength && part.length < minLength + 3 && part.endsWith('.'))
      ) {
        start++;
      } else {
        break;
      }
    }

    // avoid blacklisted terms
    if (
      blacklist.indexOf(parts[start]) !== -1 &&
      !(start + 1 !== parts.length && parts[start + 1].length >= minLength)
    ) {
      if (start === 0) {
        console.warn('teamnameShortener', 'cannot extend blacklisted term');
      } else {
        start--;
      }
    }

    // kill prefixes
    if (start < parts.length) {
      parts = parts.slice(start);
    }

    // reassemble
    return parts.join(' ');
}
