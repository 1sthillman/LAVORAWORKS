#!/usr/bin/env python3
"""
Firebase Rules $other fixer
Moves $other wildcard to the end of each object
"""

import json
import re

def fix_rules(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse JSON
    try:
        rules = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        return False
    
    # Rekursif olarak $other'ı sona taşı
    def move_other_to_end(obj):
        if not isinstance(obj, dict):
            return obj
        
        # İlk önce tüm alt objeleri işle
        for key, value in list(obj.items()):
            obj[key] = move_other_to_end(value)
        
        # Eğer $other varsa, onu sona taşı
        if '$other' in obj:
            other_value = obj.pop('$other')
            obj['$other'] = other_value
        
        return obj
    
    # Rules'u düzelt
    fixed_rules = move_other_to_end(rules)
    
    # JSON olarak yaz
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(fixed_rules, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Fixed rules written to: {output_file}")
    return True

if __name__ == '__main__':
    input_file = r'C:\lavoraworklow\html\lavora-database-rules.json'
    output_file = r'C:\lavoraworklow\html\lavora-database-rules-fixed.json'
    
    if fix_rules(input_file, output_file):
        print("✅✅✅ SUCCESS!")
    else:
        print("❌ FAILED!")
