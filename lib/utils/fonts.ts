export type GoogleFont = {
  family: string
  variants: string[]
  category: string
}

export async function getGoogleFonts(): Promise<GoogleFont[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY}&sort=popularity`,
    )

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error("Error fetching Google Fonts:", error)
    return []
  }
}

export function getFontUrl(family: string) {
  return `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}&display=swap`
}

