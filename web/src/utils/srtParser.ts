/**
 * SRT Subtitle Parser Utility
 * 
 * Parses SRT (SubRip) format subtitles into a structured format
 * suitable for video player display.
 * 
 * SRT Format Example:
 * 1
 * 00:00:00,000 --> 00:00:03,000
 * This is the first subtitle
 * 
 * 2
 * 00:00:04,000 --> 00:00:07,000
 * This is the second subtitle
 */

export interface SubtitleEntry {
    start: number
    end: number
    text: string
}

/**
 * Parse raw SRT string into structured subtitle entries
 * @param srtContent - Raw SRT file content as string
 * @returns Array of SubtitleEntry objects with timing and text
 */
export function parseSRT(srtContent: string): SubtitleEntry[] {
    if (!srtContent || typeof srtContent !== 'string') {
        return []
    }

    const subtitles: SubtitleEntry[] = []
    
    // Split by double newline to separate subtitle blocks
    const blocks = srtContent.split('\n\n').filter(block => block.trim())

    for (const block of blocks) {
        const lines = block.trim().split('\n')
        
        // Each block should have at least 3 lines (index, timecode, text)
        if (lines.length < 3) continue

        // Line format: HH:MM:SS,mmm --> HH:MM:SS,mmm
        const timecodeLine = lines[1]
        if (!timecodeLine || !timecodeLine.includes('-->')) continue

        try {
            const [startStr, endStr] = timecodeLine.split('-->').map(s => s.trim())
            
            const start = timeToSeconds(startStr)
            const end = timeToSeconds(endStr)
            
            // Remaining lines are subtitle text
            const text = lines.slice(2).join('\n').trim()
            
            if (text) {
                subtitles.push({ start, end, text })
            }
        } catch (error) {
            console.warn(`Failed to parse subtitle block: ${block.substring(0, 50)}...`)
            continue
        }
    }

    return subtitles
}

/**
 * Convert SRT timecode format (HH:MM:SS,mmm) to seconds
 * @param timeStr - Timecode string in format HH:MM:SS,mmm
 * @returns Number of seconds
 */
function timeToSeconds(timeStr: string): number {
    const match = timeStr.match(/(\d+):(\d+):(\d+)[,.](\d+)/)
    
    if (!match) {
        throw new Error(`Invalid timecode format: ${timeStr}`)
    }

    const [, hours, minutes, seconds, milliseconds] = match.map(Number)
    
    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
}

/**
 * Format seconds back to SRT timecode format
 * @param seconds - Number of seconds
 * @returns Formatted timecode string (HH:MM:SS,mmm)
 */
export function secondsToSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const millis = Math.round((seconds % 1) * 1000)

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

/**
 * Validate if a string is valid SRT format
 * @param content - String to validate
 * @returns true if content appears to be SRT format
 */
export function isSRTFormat(content: string): boolean {
    if (!content || typeof content !== 'string') return false
    
    // Check for common SRT patterns:
    // - Contains timecode pattern (HH:MM:SS --> HH:MM:SS)
    // - Contains numbered blocks (1, 2, 3, etc.)
    const hasTimecode = /\d{2}:\d{2}:\d{2}[,\.]\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}[,\.]\d{3}/.test(content)
    const hasNumbering = /^\d+$/m.test(content.trim())
    
    return hasTimecode && hasNumbering
}
