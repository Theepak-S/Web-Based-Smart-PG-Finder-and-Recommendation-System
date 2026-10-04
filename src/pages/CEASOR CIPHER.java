import java.util.Scanner; public class CaesarCipher {
public static String encrypt(String text, int shift) {
StringBuilder result = new StringBuilder(); for (int i = 0; i < text.length(); i++) {
char ch = text.charAt(i);
if (Character.isUpperCase(ch)) {
char c = (char) (((ch - 'A' + shift) % 26) + 'A'); result.append(c);
}
else if (Character.isLowerCase(ch)) {
char c = (char) (((ch - 'a' + shift) % 26) + 'a'); result.append(c);
 
}
else {
result.append(ch);
}
}
return result.toString();
}
public static String decrypt(String text, int shift) {
return encrypt(text, 26 - shift); 
}
public static void main(String[] args) { Scanner scanner = new Scanner(System.in);
System.out.print("Enter the text to be encrypted: "); String text = scanner.nextLine();
System.out.print("Enter the shift key (1-25): "); int shift = scanner.nextInt();
shift = shift % 26; 
String encryptedText = encrypt(text, shift); System.out.println("Encrypted Text: " + encryptedText);
String decryptedText = decrypt(encryptedText, shift); System.out.println("Decrypted Text: " + decryptedText);
}
}



