import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ActivityIndicator, useWindowDimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ─── Robust Pagination Engine ──────────────────────────────────────
// Splits full text into realistic, non-scrollable pages of ~850 chars.
function paginateBookText(text: string, maxChars = 850) {
  // Normalize line endings to avoid single-page windows-split failure
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const startMarker = "*** START OF THE PROJECT GUTENBERG EBOOK";
  const endMarker = "*** END OF THE PROJECT GUTENBERG EBOOK";
  let mainText = normalized;
  
  const startIdx = normalized.indexOf(startMarker);
  const endIdx = normalized.indexOf(endMarker);
  
  if (startIdx !== -1) {
    const actualStart = normalized.indexOf('\n', startIdx) + 1;
    mainText = normalized.slice(actualStart, endIdx !== -1 ? endIdx : normalized.length);
  }
  
  const paragraphs = mainText.split('\n\n');
  const pages: string[] = [];
  let currentPageText = '';
  
  for (const paragraph of paragraphs) {
    const cleanParagraph = paragraph.trim();
    if (!cleanParagraph) continue;
    
    // If a paragraph is huge, split by sentences to prevent page overflow
    if (cleanParagraph.length > maxChars) {
      if (currentPageText) {
        pages.push(currentPageText.trim());
        currentPageText = '';
      }
      
      const sentences = cleanParagraph.split('. ');
      let tempText = '';
      for (let i = 0; i < sentences.length; i++) {
        let sentence = sentences[i];
        if (i < sentences.length - 1) {
          sentence += '.';
        }
        if (tempText.length + sentence.length > maxChars) {
          if (tempText) {
            pages.push(tempText.trim());
          }
          tempText = sentence + ' ';
        } else {
          tempText += sentence + ' ';
        }
      }
      if (tempText.trim()) {
        currentPageText = tempText;
      }
    } else if (currentPageText.length + cleanParagraph.length > maxChars) {
      pages.push(currentPageText.trim());
      currentPageText = cleanParagraph + '\n\n';
    } else {
      currentPageText += cleanParagraph + '\n\n';
    }
  }
  
  if (currentPageText.trim()) {
    pages.push(currentPageText.trim());
  }
  
  return pages;
}

export default function ReaderScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentPage, setCurrentPage] = useState(1); // odd numbers represent the left page when spread is active
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Two page spread condition (web/tablet width threshold)
  const isDoublePage = width >= 768;

  useEffect(() => {
    async function loadBook() {
      try {
        setLoading(true);
        const bookId = (id === '1' || id === '2') ? '84' : id; 
        
        const res = await fetch(`/books/${bookId}.txt`);
        if (!res.ok) throw new Error('Local book fetch returned ' + res.status);
        const text = await res.text();
        
        const paginatedPages = paginateBookText(text);
        setPages(paginatedPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading book:", err);
        setPages(["Error loading book content. Please verify that public/books/" + id + ".txt is downloaded."]);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id]);

  const totalPages = Math.max(1, pages.length);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const isDark = theme === 'dark';
  
  // Custom warm theme colors to simulate real paper
  const screenBg = isDark ? '#121210' : '#E8DFD1'; // Dark backdrop vs Wooden table color
  const pageBg = isDark ? '#1C1C1A' : '#FCF9F2';   // E-ink dark page vs Premium paper page
  const textColor = isDark ? '#CCCCCC' : '#2D2C2A';
  const toolbarBg = isDark ? '#1A1918' : '#FDFBF7';
  const borderColor = isDark ? '#2D2C2A' : '#E5E5E5';
  const spineColor = isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.06)';
  const pageShadow = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(45,44,42,0.1)';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      {/* Top Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: toolbarBg, borderBottomColor: borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-down" size={28} color={textColor} />
        </Pressable>
        <Text style={[styles.bookTitle, { color: textColor }]}>Book Reader</Text>
        <Pressable onPress={toggleTheme} style={styles.iconBtn}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={textColor} />
        </Pressable>
      </View>

      {/* Reader Canvas / Simulated Book */}
      {loading ? (
        <View style={[styles.bookWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={textColor} />
          <Text style={{ marginTop: 16, color: textColor, fontWeight: '500', fontFamily: 'serif' }}>Parsing Gutenberg Pages...</Text>
        </View>
      ) : (
        <View style={styles.bookWrapper}>
          <View style={[styles.bookBody, { backgroundColor: pageBg, shadowColor: pageShadow }]}>
            
            {/* LEFT PAGE (Always visible) */}
            <View style={[styles.pageContainer, isDoublePage && styles.leftPageBorder]}>
              <View style={styles.pageHeader}>
                <Text style={[styles.pageHeaderText, { color: isDark ? '#737373' : '#A3A3A3' }]} numberOfLines={1}>
                  Chapter Content
                </Text>
              </View>
              
              <ScrollView style={styles.pageContent} contentContainerStyle={styles.pageContentScroll} showsVerticalScrollIndicator={true}>
                <Text style={[styles.bodyText, { color: textColor }]}>
                  {pages[currentPage - 1]}
                </Text>
              </ScrollView>
              
              <View style={styles.pageFooter}>
                <Text style={[styles.pageNumberText, { color: isDark ? '#737373' : '#A3A3A3' }]}>
                  {currentPage}
                </Text>
              </View>
            </View>

            {/* SPINE / FOLD SHADOW (Only visible in double page spread mode) */}
            {isDoublePage && (
              <View style={[styles.spine, { backgroundColor: spineColor }]} />
            )}

            {/* RIGHT PAGE (Visible only on wide layouts) */}
            {isDoublePage && (
              <View style={styles.pageContainer}>
                <View style={styles.pageHeader}>
                  <Text style={[styles.pageHeaderText, { color: isDark ? '#737373' : '#A3A3A3', textAlign: 'right' }]} numberOfLines={1}>
                    Book ID: {id}
                  </Text>
                </View>
                
                <ScrollView style={styles.pageContent} contentContainerStyle={styles.pageContentScroll} showsVerticalScrollIndicator={true}>
                  {currentPage < totalPages ? (
                    <Text style={[styles.bodyText, { color: textColor }]}>
                      {pages[currentPage]}
                    </Text>
                  ) : (
                    <View style={styles.endOfBook}>
                      <Ionicons name="book-outline" size={48} color={isDark ? '#525252' : '#D4D4D4'} />
                      <Text style={[styles.endOfBookText, { color: isDark ? '#737373' : '#A3A3A3' }]}>
                        End of Book
                      </Text>
                    </View>
                  )}
                </ScrollView>
                
                <View style={styles.pageFooter}>
                  <Text style={[styles.pageNumberText, { color: isDark ? '#737373' : '#A3A3A3', textAlign: 'right' }]}>
                    {currentPage + 1 <= totalPages ? currentPage + 1 : ''}
                  </Text>
                </View>
              </View>
            )}

          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={[styles.bottomToolbar, { backgroundColor: toolbarBg, borderTopColor: borderColor }]}>
        <Pressable 
          style={[styles.pageBtn, (currentPage === 1) && styles.disabledBtn]} 
          onPress={() => setCurrentPage(p => Math.max(1, isDoublePage ? p - 2 : p - 1))}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? (isDark ? '#404040' : '#D4D4D4') : textColor} />
          <Text style={{ color: currentPage === 1 ? (isDark ? '#404040' : '#D4D4D4') : textColor, marginLeft: 4, fontWeight: '600', fontFamily: 'serif' }}>Prev</Text>
        </Pressable>

        <View style={styles.progressContainer}>
          <Text style={{ color: isDark ? '#A3A3A3' : '#737373', fontWeight: '500', marginBottom: 8, fontSize: 13, fontFamily: 'serif' }}>
            {isDoublePage 
              ? `Pages ${currentPage}-${Math.min(totalPages, currentPage + 1)} of ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`
            }
          </Text>
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#33322E' : '#E5E5E5' }]}>
            <View style={[
              styles.progressFill, 
              { 
                width: `${(Math.min(totalPages, isDoublePage ? currentPage + 1 : currentPage) / totalPages) * 100}%`, 
                backgroundColor: isDark ? '#E5E5E5' : '#2D2C2A' 
              }
            ]} />
          </View>
        </View>

        <Pressable 
          style={[styles.pageBtn, (isDoublePage ? currentPage + 1 >= totalPages : currentPage >= totalPages) && styles.disabledBtn]} 
          onPress={() => setCurrentPage(p => Math.min(totalPages, isDoublePage ? p + 2 : p + 1))}
          disabled={isDoublePage ? currentPage + 1 >= totalPages : currentPage >= totalPages}
        >
          <Text style={{ color: (isDoublePage ? currentPage + 1 >= totalPages : currentPage >= totalPages) ? (isDark ? '#404040' : '#D4D4D4') : textColor, marginRight: 4, fontWeight: '600', fontFamily: 'serif' }}>Next</Text>
          <Ionicons name="chevron-forward" size={24} color={(isDoublePage ? currentPage + 1 >= totalPages : currentPage >= totalPages) ? (isDark ? '#404040' : '#D4D4D4') : textColor} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 8,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  bookWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBody: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxWidth: 1000,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  leftPageBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
  },
  spine: {
    width: 16,
    height: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pageHeader: {
    height: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pageHeaderText: {
    fontSize: 11,
    fontFamily: 'serif',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pageContent: {
    flex: 1,
  },
  pageContentScroll: {
    justifyContent: 'flex-start',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'serif',
  },
  pageFooter: {
    height: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    marginTop: 16,
  },
  pageNumberText: {
    fontSize: 12,
    fontFamily: 'serif',
    fontWeight: '600',
  },
  endOfBook: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endOfBookText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '600',
  },
  bottomToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});
