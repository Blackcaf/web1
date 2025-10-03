export class HitChecker {
    isPointInArea(x, y, r) {
        if (!r || r <= 0) return false;
        if (x >= -r / 2 && x <= 0 && y >= 0 && y <= r) return true;
        if (x <= 0 && y <= 0 && (x * x + y * y) <= (r / 2) * (r / 2)) return true;
        if (x >= 0 && x <= r / 2 && y <= 0 && y >= -r) {
            if (y - 2 * x + r >= 0) return true;
        }
        return false;
    }
}